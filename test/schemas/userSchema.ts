import {EntityTypeFromSchema} from '../../src/schemas';

export type User = EntityTypeFromSchema<typeof userSchema>;

export const userSchema = {
  model: 'User',
  primaryKeys: ['id'],
  attributes: {
    id: 'string',
    email: 'string',
  }  as const,
  associations: [
    {
      target: 'Project',
      through: 'ProjectAssignment',
      foreignKey: 'userId',
      type: 'belongsToMany',
      key: 'projects',
    } as const,
  ],
};
