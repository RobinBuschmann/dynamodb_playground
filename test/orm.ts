import { DynamoDB } from 'aws-sdk';

import { createORM } from '../src/orm';

const tableName = 'TestTable';

export const orm = createORM({
  tableName,
  dynamoDBOptions: {
    credentials: { accessKeyId: 'none', secretAccessKey: 'none' },
    endpoint: 'http://localhost:8000',
    region: 'eu-central-1',
  },
});

const { dynamoDB } = orm;

export const createItem = item =>
  dynamoDB
    .putItem({
      TableName: tableName,
      Item: DynamoDB.Converter.marshall(item),
    })
    .promise();

export const createItems = items =>
  dynamoDB
    .batchWriteItem({
      RequestItems: {
        [tableName]: items.map(item => ({
          PutRequest: {
            Item: DynamoDB.Converter.marshall(item),
          },
        })),
      },
    })
    .promise();

export const deleteItem = item =>
  dynamoDB
    .deleteItem({
      TableName: tableName,
      Key: DynamoDB.Converter.marshall(item),
    })
    .promise();

export const deleteTable = () =>
  dynamoDB
    .deleteTable({
      TableName: tableName,
    })
    .promise();

export const createTable = () =>
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
        {
          AttributeName: '__model',
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
        {
          IndexName: 'GSI2',
          KeySchema: [
            {
              AttributeName: '__model',
              KeyType: 'HASH',
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
