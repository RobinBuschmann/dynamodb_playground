import {associate} from './associations';
import {createIdentifier, getPrimaryKeyConcatValue} from './utils';
import {entries} from './entries';
import {schemas} from './schemas';

const mapAndCacheAll = (entries, schemas) => entries.reduce((cache, entry) => {
  const schema = schemas[entry.__model];
  const instance = mapOne(entry, schema);
  const identifier = createIdentifier(entry.__model, getPrimaryKeyConcatValue(schema, entry));
  cache.set(identifier, instance);
  schema.references?.forEach(({foreignKey, model}) => {
    const refIdentifier = createIdentifier(entry.__model, foreignKey, instance[foreignKey], model);
    const refInstances = cache.get(refIdentifier) ?? [];
    cache.set(refIdentifier, [...refInstances, instance]);
  });
  return cache;
}, new Map());

const mapOne = (entry, schema) => {
  const instance = schema.entityClass ? new schema.entityClass() : {};
  const values = schema.attributes.reduce((acc, attr) => ({
    ...acc,
    [attr.key]: entry[attr.field || attr.key],
  }), {});
  return Object.assign(instance, values);
};

const process = (entries, schemas) => {
  const cache = mapAndCacheAll(entries, schemas);
  return associate(cache, entries, schemas);
};

const results = process(entries, schemas);
console.log(results);
