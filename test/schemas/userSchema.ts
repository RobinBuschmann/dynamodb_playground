export const userSchema = {
  model: 'User',
  primaryKeys: ['id'],
  attributes: {
    id: 'string',
    email: 'string',
  } as const,
};
