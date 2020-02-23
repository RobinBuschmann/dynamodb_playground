import { createIdentifier, getForeignKey, getPrimaryKey } from './utils';

export const associate = ({ cache, entries, schemas, allowedAssociationKeyMap }) =>
  entries.map(entry => {
    const schema = schemas[entry.__model];
    const instance = entry.__instance;
    const allowedAssociationKeys = allowedAssociationKeyMap.get(schema.classRef ?? schema.model) ?? [];
    schema.associations
      ?.filter(({ key }) => allowedAssociationKeys.includes(key))
      .forEach(association =>
        associations[association.type]({
          cache,
          association,
          schemas,
          instance,
          source: schema,
        }),
      );
    return instance;
  });

export const hasMany = ({ instance, association, schemas, source, cache }) => {
  const target = schemas[association.target];
  const primaryKey = getPrimaryKey({ source });
  const associatedInstances = cache.get(
    createIdentifier(target.model, association.foreignKey, instance[primaryKey], source.model),
  );
  if (associatedInstances) {
    instance[association.key] = associatedInstances;
  }
};

export const hasOne = ({ instance, association, schemas, source, cache }) => {
  const target = schemas[association.target];
  const primaryKey = getPrimaryKey({ source });
  const [associatedInstance] = cache.get(
    createIdentifier(target.model, association.foreignKey, instance[primaryKey], source.model),
  );
  if (associatedInstance) {
    instance[association.key] = associatedInstance;
  }
};

export const belongsTo = ({ instance, association, schemas, source, cache }) => {
  const target = schemas[association.target];
  const foreignKey = getForeignKey({ source, target });
  const associatedInstance = cache.get(createIdentifier(target.model, instance[foreignKey]));
  if (associatedInstance) {
    instance[association.key] = cache.get(createIdentifier(target.model, instance[foreignKey]));
  }
};

export const belongsToMany = ({ instance, association, source, schemas, cache }) => {
  const target = schemas[association.target];
  const through = schemas[association.through];
  const primaryKey = getPrimaryKey({ source });
  const throughIdentifier = createIdentifier(through.model, association.foreignKey, instance[primaryKey], source.model);
  const throughInstances = cache.get(throughIdentifier);
  throughInstances?.map(throughInstance => {
    const foreignKey = getForeignKey({ source: through, target });
    const targetInstance = cache.get(createIdentifier(target.model, throughInstance[foreignKey]));
    if (targetInstance) {
      targetInstance[through.model] = throughInstance;
      if (!Array.isArray(instance[association.key])) {
        instance[association.key] = [];
      }
      instance[association.key].push(targetInstance);
    }
  });
};

const associations = { belongsToMany, hasMany, hasOne, belongsTo };
