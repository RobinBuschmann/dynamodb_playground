import { createItems, createTable, deleteTable, find, orm } from './orm';
import { userSchema } from './schemas/userSchema';
import { userRepository } from './repositories/userRepository';

const user1 = { id: '1', email: 'test@email' };
const user2 = { id: '2', email: 'test2@email' };
const users = [user1, user2];

beforeAll(async () => {
  orm.addSchema(userSchema);
  try {
    await deleteTable();
  } catch {}
  await createTable();
  await createItems(
    users.map(user => ({
      firstKey: `USER#${user.id}`,
      secondKey: `USER#${user.email}`,
      __model: userSchema.model,
      ...user,
    })),
  );
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
//
// it('should ', async () => {
//   const document = data => ({
//     firstKey: `USER#${data.userId}`,
//     secondKey: `DOCUMENT#${data.id}`,
//     ...data,
//   });
//   const vorgangDocument = data => ({
//     firstKey: `USER#${data.userId}`,
//     secondKey: `DOCUMENT#${data.documentId}#VORGANG#${data.vorgangId}`,
//     ...data,
//   });
//   await createItems([
//     {
//       firstKey: `USER#1`,
//       secondKey: `USER#rob@email.de`,
//     },
//     document({ id: '1', userId: '1' }),
//     document({ id: '2', userId: '1' }),
//     document({ id: '3', userId: '1' }),
//     document({ id: '4', userId: '1' }),
//     vorgangDocument({ documentId: '1', userId: '1', vorgangId: '1' }),
//     vorgangDocument({ documentId: '1', userId: '1', vorgangId: '2' }),
//     vorgangDocument({ documentId: '2', userId: '1', vorgangId: '1' }),
//     vorgangDocument({ documentId: '3', userId: '1', vorgangId: '1' }),
//     vorgangDocument({ documentId: '4', userId: '1', vorgangId: '1' }),
//   ]);
//
//   const res = await find();
//   console.log(res);
// });
