import { ItemList } from 'aws-sdk/clients/dynamodb';
import { DynamoDB } from 'aws-sdk';

import { createIdentifier, getPrimaryKeyConcatValue } from './utils';

export const mapAll = (itemList: ItemList, schemas, target) =>
  itemList.reduce(
    ({ cache, entries, targetInstances }, item) => {
      const entry = DynamoDB.Converter.unmarshall(item);
      const schema = schemas[entry.__model];
      const instance = mapOne(entry, schema);
      const identifier = createIdentifier(entry.__model, getPrimaryKeyConcatValue(schema, entry));
      entry.__instance = instance;
      schema.references?.forEach(({ foreignKey, model }) => {
        const refIdentifier = createIdentifier(entry.__model, foreignKey, instance[foreignKey], model);
        const refInstances = cache.get(refIdentifier) ?? [];
        cache.set(refIdentifier, [...refInstances, instance]);
      });
      cache.set(identifier, instance);
      entries.push(entry);
      if (target.model === entry.__model) {
        targetInstances.push(instance);
      }
      return { cache, entries, targetInstances };
    },
    { cache: new Map(), entries: [], targetInstances: [] },
  );

export const mapOne = (entry, schema) => {
  const instance = schema.classRef ? new schema.classRef() : {};
  const values = Object.entries(schema.attributes).reduce((acc, [key, attr]: [any, any]) => {
    const value = entry[attr.field || key];
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  return Object.assign(instance, values);
};
