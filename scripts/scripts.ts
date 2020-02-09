import { DynamoDB } from 'aws-sdk';
import {createORM} from '../src/orm';

const dynamoDB = new DynamoDB({
  credentials: { accessKeyId: 'none', secretAccessKey: 'none' },
  endpoint: 'http://localhost:8000',
  region: 'eu-central-1',
});

const main = async () => {
  try {

    const userSchema = {
      model: 'User',
      primaryKeys: ['id'],
      attributes: {
        // firstKey: 'string',
        // secondKey: 'string',

        id: 'string',
        email: 'string',
      } as const,
    };

    const orm = createORM({
      tableName: 'MyApp',
      schemas: {
        [userSchema.model]: userSchema,
      },
      dynamoDBOptions: {
        credentials: { accessKeyId: 'none', secretAccessKey: 'none' },
        endpoint: 'http://localhost:8000',
        region: 'eu-central-1',
      },
    });

    const userRepository = orm.createRepository(
      userSchema,
      {
        findByEmail: ({ email }: { email: string }) =>
          ({
            indexName: 'GSI1',
            keyConditionExpression: 'secondKey = :secondKey',
            expressionAttributeValues: {
              ':secondKey': `USER#${email}`,
            },
            multi: false,
          } as const),
      },
    );
    const user = await userRepository.findByEmail({email: 'rob@email.de'});
    // await deleteItem({id: '1', email: 'rob@email.de'});
    // await createUser({id: '1', email: 'rob@email.de', __model: 'User'});
    console.log(user);

  } catch (e) {
    console.error(e);
  }
};

const getByEmail = ({ email }) =>
  dynamoDB
    .query({
      TableName: 'MyApp',
      IndexName: 'GSI1',
      KeyConditionExpression: 'secondKey = :secondKey',
      ExpressionAttributeValues: DynamoDB.Converter.marshall({
        ':secondKey': `USER#${email}`,
      }),
    })
    .promise();

const deleteItem = ({ id, email }) =>
  dynamoDB
    .deleteItem({
      TableName: 'MyApp',
      Key: DynamoDB.Converter.marshall({
        firstKey: `USER#${id}`,
        secondKey: `USER#${email}`,
      }),
    })
    .promise();

const createUser = (user) =>
  dynamoDB
    .putItem({
      TableName: 'MyApp',
      Item: DynamoDB.Converter.marshall({
        firstKey: `USER#${user.id}`,
        secondKey: `USER#${user.email}`,
        ...user,
      }),
    })
    .promise();

const createDocument = ({ userId, documentId, filename }) =>
  dynamoDB
    .putItem({
      TableName: 'MyApp',
      Item: DynamoDB.Converter.marshall({
        firstKey: `USER#${userId}`,
        secondKey: `DOCUMENT#${documentId}`,
        filename,
      }),
    })
    .promise();

const createTable = () =>
  dynamoDB
    .createTable({
      TableName: 'MyApp',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      AttributeDefinitions: [
        {
          AttributeName: 'firstKey',
          AttributeType: 'S',
        },
        {
          AttributeName: 'secondKey',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'firstKey',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'secondKey',
          KeyType: 'RANGE',
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            {
              AttributeName: 'secondKey',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'firstKey',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
    })
    .promise();

main();
