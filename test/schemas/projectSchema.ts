import {createSchema, EntityTypeFromSchema} from '../../src/schemas';

export type Project = EntityTypeFromSchema<typeof projectSchema>;

export const projectSchema = createSchema({
  model: 'Project',
  primaryKeys: ['id'],
  attributes: {
    id: 'string',
    title: 'string',
    users: Array,
  } as const,
  associations: [
    {
      target: 'User',
      through: 'ProjectAssignment',
      foreignKey: 'projectId',
      type: 'belongsToMany',
      key: 'users',
    },
  ],
});
