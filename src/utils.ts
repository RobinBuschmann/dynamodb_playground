export type Type = new (...args: any[]) => any;

export function createIdentifier(modelId: string, primaryKeyValue: string): string;
export function createIdentifier(
  modelId: string,
  foreignKey: string,
  foreignKeyValue: string,
  refModelId: string,
): string;
export function createIdentifier(...args: string[]) {
  if (args.length === 2) {
    const [modelId, primaryKeyValue] = args;
    return `${modelId}@${primaryKeyValue}`;
  }
  const [modelId, foreignKey, foreignKeyValue, refModelId] = args;
  return `${refModelId}@${modelId}.${foreignKey}=${foreignKeyValue}`;
}

export const getPrimaryKeyConcatValue = (schema, entry) => schema.primaryKeys.map(pk => entry[pk]).join('|');

export const getPrimaryKey = ({ source }) => {
  if (source.primaryKeys.length > 1) {
    throw new Error(`Cannot resolve primary key of ${source.model}. Multiple primary keys aren't supported`);
  }
  const [primaryKey] = source.primaryKeys;
  return primaryKey;
};

export const getForeignKey = ({ source, target }) => {
  const [foreignKey] = source.references.filter(ref => ref.model === target.model);
  return foreignKey;
};
