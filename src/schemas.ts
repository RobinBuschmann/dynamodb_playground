import { Type } from './utils';

export interface Reference {
  foreignKey: string;
  model: string;
}
export interface Association {
  target: string;
  through?: string;
  key: string;
  foreignKey: string;
  type: 'belongsToMany' | 'hasMany' | 'hasOne' | 'belongsTo';
}
export interface Schema<TClassRef, TAttributes extends Attributes> {
  model: string;
  classRef?: TClassRef;
  primaryKeys: string[];
  attributes: TAttributes;
  references?: Reference[];
  associations?: Association[];
}
type AttributeType = 'string' | 'boolean' | 'number' | Type;
export interface Attribute {
  type: AttributeType;
  array?: boolean;
}
export type Attributes = {
  [key: string]: Attribute | AttributeType;
};

export type Schemas = {
  [model: string]: Schema<any, any>;
};
export type EntityTypeFromSchema<TSchema extends Schema<any, any>> = {
  [TAttrKey in keyof TSchema['attributes']]: EntityAttrType<TSchema['attributes'][TAttrKey]>;
};
export type EntityTypeFromAttributes<TAttributes extends Attributes> = {
  [TAttrKey in keyof TAttributes]: EntityAttrType<TAttributes[TAttrKey]>;
};
type EntityAttrType<T> = T extends {type: 'string', array: true}
  ? string[]
  : T extends 'string' | {type: 'string'}
    ? string
    : any
