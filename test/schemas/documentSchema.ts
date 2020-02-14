import { createSchema } from '../../src/schemas';

export const documentSchema = createSchema({
  model: 'Document',
  primaryKeys: ['id'],
  attributes: {
    id: 'string',
    filename: 'string',
    createdBy: 'string',
    vorgaenge: Object,
    vorgang: Object,
  } as const,
  associations: [
    {
      target: 'VorgangDocument',
      foreignKey: 'documentId',
      type: 'hasMany',
      key: 'vorgaenge',
    },
    {
      target: 'VorgangDocument',
      foreignKey: 'documentId',
      type: 'hasOne',
      key: 'vorgang',
    },
  ],
});
