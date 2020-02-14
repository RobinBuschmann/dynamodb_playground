import { DynamoDB } from 'aws-sdk';

import { repositoryCreatorFactory } from './repositories';
import { Schema, Schemas } from './schemas';

interface ORMOptions {
  dynamoDBOptions?: DynamoDB.Types.ClientConfiguration;
  tableName?: string;
  schemas?: Schemas;
}

const defaultOptions = {
  schemas: {},
};

export const createORM = ({ dynamoDBOptions, ...options }: ORMOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const dynamoDB = new DynamoDB(dynamoDBOptions);
  const createRepository = repositoryCreatorFactory({ dynamoDB, ...mergedOptions });

  const addSchema = (schema: Schema<any, any>) => (mergedOptions.schemas[schema.model] = schema);

  return { createRepository, dynamoDB, addSchema };
};
