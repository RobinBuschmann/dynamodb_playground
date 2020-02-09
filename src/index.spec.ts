import {dynamoDBClientFactory} from '../test/utils';
import {createORM} from './orm';

const tableName = 'TestTable';
let dynamoDBClient: ReturnType<typeof dynamoDBClientFactory>;
let orm: ReturnType<typeof createORM>;

beforeAll(async () => {
  orm = createORM({
    tableName,
    dynamoDBOptions: {
      credentials: { accessKeyId: 'none', secretAccessKey: 'none' },
      endpoint: 'http://localhost:8000',
      region: 'eu-central-1',
    },
  });
  dynamoDBClient = dynamoDBClientFactory(orm.dynamoDB);
  await dynamoDBClient.createTable(tableName);
});

afterAll(async () => {
  await dynamoDBClient.deleteTable(tableName);
});

describe('repository', function() {
  let userRepository: ReturnType<typeof orm.createRepository>;
  const userSchema = {
    model: 'User',
    primaryKeys: ['id'],
    attributes: {
      id: 'string',
      email: 'string',
    } as const,
  };

  beforeAll(() => {
    orm.addSchema(userSchema);
    userRepository = orm.createRepository(userSchema, {
      findByEmail: ({ email }: { email: string }) =>
        ({
          indexName: 'GSI1',
          keyConditionExpression: 'secondKey = :secondKey AND begins_with(firstKey, :firstKey)',
          expressionAttributeValues: {
            ':secondKey': `USER#${email}`,
            ':firstKey': `USER`,
          },
          multi: false,
        } as const),
      findById: ({ id }: { id: string }) =>
        ({
          keyConditionExpression: 'firstKey = :firstKey',
          expressionAttributeValues: {
            ':firstKey': `USER#${id}`,
          },
          multi: false,
        } as const),
    });
  });

  it('should return mapped instance', async () => {
    const user = { id: '1', email: 'test@email' };
    await dynamoDBClient.createItem(tableName, {
      firstKey: `USER#${user.id}`,
      secondKey: `USER#${user.email}`,
      __model: userSchema.model,
      ...user,
    });
    const foundUser = await userRepository.findByEmail(user);
    expect(foundUser).toEqual(user);
  });
});
