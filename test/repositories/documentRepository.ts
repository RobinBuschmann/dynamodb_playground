import { orm } from '../orm';
import { documentSchema } from '../schemas/documentSchema';

export const documentRepository = orm.createRepository(documentSchema, {
  findAllByUserId: ({ userId }: { userId: string }) =>
    ({
      keyConditionExpression: 'firstKey = :firstKey AND begins_with(secondKey, :secondKey)',
      expressionAttributeValues: {
        ':firstKey': `USER#${userId}`,
        ':secondKey': `DOCUMENT`,
      },
      associations: [['Document', ['vorgaenge']]],
      multi: true,
    } as const),
  findAllByUserIdAndVorgangId: ({ userId, vorgangId }: { userId: string; vorgangId: string }) =>
    ({
      keyConditionExpression: 'firstKey = :firstKey AND begins_with(secondKey, :secondKey)',
      filterExpression: 'vorgangId = :vorgangId OR attribute_not_exists(vorgangId)',
      expressionAttributeValues: {
        ':firstKey': `USER#${userId}`,
        ':secondKey': `DOCUMENT`,
        ':vorgangId': vorgangId,
      },
      associations: [['Document', ['vorgang']]],
      multi: true,
    } as const),
  findById: ({ id }: { id: string }) =>
    ({
      indexName: 'GSI1',
      keyConditionExpression: 'secondKey = :secondKey AND begins_with(firstKey, :firstKey)',
      expressionAttributeValues: {
        ':firstKey': `USER`,
        ':secondKey': `DOCUMENT#${id}`,
      },
      multi: false,
    } as const),
  findAll: () =>
    ({
      indexName: 'GSI2',
      keyConditionExpression: '#model = :model',
      expressionAttributeValues: {
        ':model': `Document`,
      },
      expressionAttributeNames: {
        '#model': '__model',
      },
      multi: true,
    } as const),
});
