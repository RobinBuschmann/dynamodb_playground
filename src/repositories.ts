import { DynamoDB } from 'aws-sdk';

import { mapAll } from './mapper';
import { associate } from './associations';
import { Type } from './utils';
import { Attributes, EntityTypeFromAttributes, EntityTypeFromSchema, Schema } from './schemas';

type AssociationOption = readonly [string, ReadonlyArray<string>] | readonly [Type, ReadonlyArray<string>];
type CreateQueryOptionsGetter = (params: object) => CreateQueryOptions;

interface CreateQueryOptions {
  indexName?: string;
  keyConditionExpression: string;
  filterExpression?: string;
  expressionAttributeNames?: { [attributeKey: string]: string };
  expressionAttributeValues: { [attributeKey: string]: string };
  multi: boolean;
  associations?: ReadonlyArray<AssociationOption>;
}

interface CreateQueriesOptions {
  [query: string]: CreateQueryOptionsGetter;
}

interface RepositoryCreatorOptions {
  dynamoDB: DynamoDB;
  tableName?: string;
  schemas: any;
}

interface RepositoryOptions<TClassRef, TAttributes extends Attributes> extends Partial<Schema<TClassRef, TAttributes>> {
  tableName?: string;
}

type Repository<TEntity, TQueries extends CreateQueriesOptions> = {
  [TQueryKey in keyof TQueries]: (
    ...params: Parameters<TQueries[TQueryKey]>
  ) => ReturnType<TQueries[TQueryKey]>['multi'] extends false ? Promise<TEntity> : Promise<TEntity[]>;
};

type EntityType<TClassRef extends Type, TAttributes extends Attributes> = TClassRef extends undefined
  ? EntityTypeFromAttributes<TAttributes>
  : InstanceType<TClassRef>;

export const repositoryCreatorFactory = (repositoryCreatorOptions: RepositoryCreatorOptions) => <
  TAttributes extends Attributes,
  TQueries extends CreateQueriesOptions,
  TClassRef extends Type = undefined
>(
  repositoryOptions: RepositoryOptions<TClassRef, TAttributes>,
  queries: TQueries,
): Repository<EntityType<TClassRef, TAttributes>, TQueries> => {
  let target = repositoryOptions;
  if (repositoryOptions.classRef && !repositoryOptions.attributes) {
    const { getSchema, getModelName } = require('./decorators');
    const modelName = getModelName(repositoryOptions.classRef);
    let schema = repositoryCreatorOptions.schemas[modelName];
    if (!schema) {
      schema = getSchema(repositoryOptions.classRef);
    }
    target = schema;
  }
  //TODO check whether schema exists
  return Object.entries(queries).reduce(
    (acc, [name, getOptions]) => ({
      ...acc,
      [name]: params => {
        const options = { target, ...repositoryCreatorOptions, ...repositoryOptions, ...getOptions(params) };
        if (typeof options.tableName !== 'string') {
          throw new Error(`'tableName' missing`);
        }
        return query(options as QueryOptions);
      },
    }),
    {} as any,
  );
};

interface QueryOptions extends CreateQueryOptions {
  dynamoDB: DynamoDB;
  tableName: string;
  associations: any[];
  target: any;
  schemas: any;
}

const query = ({ dynamoDB, multi, target, schemas, ...options }: QueryOptions) => {
  return dynamoDB
    .query({
      TableName: options.tableName,
      IndexName: options.indexName,
      FilterExpression: options.filterExpression,
      KeyConditionExpression: options.keyConditionExpression,
      ExpressionAttributeValues: DynamoDB.Converter.marshall(options.expressionAttributeValues),
      ExpressionAttributeNames: options.expressionAttributeNames,
    })
    .promise()
    .then(result =>
      mapAndAssociate({
        items: result.Items,
        multi,
        target,
        schemas,
        allowedAssociationKeyMap: new Map(options.associations),
      }),
    );
};

interface PutItemOptions {
  dynamoDB: DynamoDB;
  tableName: string;
  item: any;
  target: any;
  schemas: any;
}

const putItem = ({ dynamoDB, ...options }: PutItemOptions) =>
  dynamoDB.putItem({
    TableName: options.tableName,
    Item: DynamoDB.Converter.marshall({
      ...options.item,
      __model: options.target.model,
    }),
  });

const mapAndAssociate = ({ items, multi, target, schemas, allowedAssociationKeyMap }) => {
  const { entries, cache, targetInstances } = mapAll(items, schemas, target);
  associate({ entries, cache, schemas, allowedAssociationKeyMap });
  return multi ? targetInstances : targetInstances[0];
};
