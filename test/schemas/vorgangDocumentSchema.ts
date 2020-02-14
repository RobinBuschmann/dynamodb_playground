import { createSchema } from '../../src/schemas';

export const vorgangDocumentSchema = createSchema({
  model: 'VorgangDocument',
  primaryKeys: ['documentId', 'vorgangId'],
  attributes: {
    documentId: 'string',
    vorgangId: 'string',
    createdBy: 'string',
    status: 'string',
  } as const,
  references: [{ foreignKey: 'documentId', model: 'Document' }],
});
