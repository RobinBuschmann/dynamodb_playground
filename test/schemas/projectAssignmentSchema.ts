import { createSchema, EntityTypeFromSchema } from '../../src/schemas';

export type ProjectAssignment = EntityTypeFromSchema<typeof projectAssignmentSchema>;

export const projectAssignmentSchema = createSchema({
  model: 'ProjectAssignment',
  primaryKeys: ['projectId', 'userId'],
  attributes: {
    projectId: 'string',
    userId: 'string',
  } as const,
  references: [
    { foreignKey: 'projectId', model: 'Project' },
    { foreignKey: 'userId', model: 'User' },
  ],
});
