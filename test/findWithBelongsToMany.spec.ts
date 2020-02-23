import { createItems, createTable, deleteTable, orm } from './orm';
import { User, userSchema } from './schemas/userSchema';
import { Project, projectSchema } from './schemas/projectSchema';
import { ProjectAssignment, projectAssignmentSchema } from './schemas/projectAssignmentSchema';
import { projectRepository } from './repositories/projectRepository';

const organization = 'ABC';

const users: User[] = [
  { id: '1', email: 'a@mail' },
  { id: '2', email: 'b@mail' },
  { id: '3', email: 'c@mail' },
  { id: '4', email: 'd@mail' },
];
const projects: Partial<Project>[] = [
  { id: '1', title: 'A' },
  { id: '2', title: 'B' },
  { id: '3', title: 'C' },
  { id: '4', title: 'D' },
];
const projectAssignments: Partial<ProjectAssignment>[] = [
  { projectId: '1', userId: '1' },
  { projectId: '1', userId: '2' },
  { projectId: '1', userId: '3' },
  { projectId: '2', userId: '4' },
  { projectId: '2', userId: '1' },
  { projectId: '3', userId: '3' },
];

beforeAll(async () => {
  orm.addSchema(userSchema);
  orm.addSchema(projectSchema);
  orm.addSchema(projectAssignmentSchema);
  try {
    await deleteTable();
  } catch {}
  await createTable();
  await createItems([
    ...users.map(user => ({
      firstKey: organization,
      secondKey: `U#${user.id}`,
      __model: userSchema.model,
      ...user,
    })),
    ...projects.map(project => ({
      firstKey: organization,
      secondKey: `P#${project.id}`,
      __model: projectSchema.model,
      ...project,
    })),
    ...projectAssignments.map(projectAssignment => ({
      firstKey: organization,
      secondKey: `PA#${projectAssignment.projectId}#${projectAssignment.userId}`,
      __model: projectAssignmentSchema.model,
      ...projectAssignment,
    })),
  ]);
});

afterAll(() => deleteTable());

it('should return documents with hasMany association resolved', async () => {
  const foundProjects = await projectRepository.findAllByOrganization({ organization });
  // TODO Prevent ProjectAssignment to be overridden by copying users
  expect(foundProjects).toEqual([
    { ...projects[0], users: [{ ...users[0], ProjectAssignment: expect.any(Object) }, { ...users[1], ProjectAssignment: expect.any(Object) }, { ...users[2], ProjectAssignment: expect.any(Object) }] },
    { ...projects[1], users: [{ ...users[0], ProjectAssignment: expect.any(Object) }, { ...users[3], ProjectAssignment: expect.any(Object) }] },
    { ...projects[2], users: [{ ...users[2], ProjectAssignment: expect.any(Object) }] },
    { ...projects[3] },
  ]);
});
