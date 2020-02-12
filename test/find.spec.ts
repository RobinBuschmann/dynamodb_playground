import { createItems, createTable, deleteTable, orm } from './orm';
import { userSchema } from './schemas/userSchema';
import { userRepository } from './repositories/userRepository';

const user1 = { id: '1', email: 'test@email' };
const user2 = { id: '2', email: 'test2@email' };
const users = [user1, user2];

beforeAll(async () => {
  orm.addSchema(userSchema);
  await createTable();
  await createItems([
    {
      firstKey: `USER#${user1.id}`,
      secondKey: `USER#${user1.email}`,
      __model: userSchema.model,
      ...user1,
    },
    {
      firstKey: `USER#${user2.id}`,
      secondKey: `USER#${user2.email}`,
      __model: userSchema.model,
      ...user2,
    },
  ]);
});

afterAll(() => deleteTable());

it('should return mapped instance by email', async () => {
  const foundUser = await userRepository.findByEmail(user1);
  expect(foundUser).toEqual(user1);
});

it('should return mapped instance by id', async () => {
  const foundUser = await userRepository.findByEmail(user2);
  expect(foundUser).toEqual(user2);
});

it('should return all mapped instance by __model', async () => {
  const foundUsers = await userRepository.findAll();
  expect(foundUsers).toEqual(expect.arrayContaining(users));
});
