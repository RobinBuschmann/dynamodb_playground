import { userSchema } from '../schemas/userSchema';
import { orm } from '../orm';

export const userRepository = orm.createRepository(userSchema, {
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
  findAll: () => ({
    indexName: 'GSI2',
    keyConditionExpression: '#model = :model',
    expressionAttributeValues: {
      ':model': `User`,
    },
    expressionAttributeNames: {
      '#model': '__model',
    },
    multi: true,
  } as const),
});
