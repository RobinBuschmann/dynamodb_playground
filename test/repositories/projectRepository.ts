import { orm } from '../orm';
import { projectSchema } from '../schemas/projectSchema';

export const projectRepository = orm.createRepository(projectSchema, {
  findAllByOrganization: ({ organization }: { organization: string }) =>
    ({
      keyConditionExpression: 'firstKey = :firstKey',
      expressionAttributeValues: {
        ':firstKey': organization,
      },
      multi: true,
      associations: [
        ['Project', ['users']],
      ]
    } as const),
});
