import { DynamoDB } from 'aws-sdk';

export const dynamoDBClientFactory = (dynamoDB: DynamoDB) => {
  const createItem = (tableName, item) =>
    dynamoDB
      .putItem({
        TableName: tableName,
        Item: DynamoDB.Converter.marshall(item),
      })
      .promise();

  const deleteItem = (tableName, item) =>
    dynamoDB
      .deleteItem({
        TableName: tableName,
        Key: DynamoDB.Converter.marshall(item),
      })
      .promise();

  const deleteTable = tableName =>
    dynamoDB
      .deleteTable({
        TableName: tableName,
      })
      .promise();

  const createTable = tableName =>
    dynamoDB
      .createTable({
        TableName: tableName,
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

  return { createTable, deleteTable, createItem, deleteItem };
};
