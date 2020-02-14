import { createItems, createTable, deleteTable, orm } from './orm';
import { documentSchema } from './schemas/documentSchema';
import { vorgangDocumentSchema } from './schemas/vorgangDocumentSchema';
import { documentRepository } from './repositories/documentRepository';

const userId = '1';

const document1 = { id: '1', filename: 'doc1.pdf', createdBy: userId };
const document2 = { id: '2', filename: 'doc2.pdf', createdBy: userId };
const document3 = { id: '3', filename: 'doc3.pdf', createdBy: userId };
const document4 = { id: '4', filename: 'doc4.pdf', createdBy: userId };
const documents = [document1, document2, document3, document4];

const vorgangDocument1 = { documentId: '1', vorgangId: '1', createdBy: userId, status: 'a' };
const vorgangDocument2 = { documentId: '1', vorgangId: '2', createdBy: userId, status: 'a' };
const vorgangDocument3 = { documentId: '2', vorgangId: '1', createdBy: userId, status: 'a' };
const vorgangDocument4 = { documentId: '3', vorgangId: '1', createdBy: userId, status: 'a' };
const vorgangDocument5 = { documentId: '4', vorgangId: '1', createdBy: userId, status: 'a' };
const vorgangDocuments = [vorgangDocument1, vorgangDocument2, vorgangDocument3, vorgangDocument4, vorgangDocument5];

beforeAll(async () => {
  orm.addSchema(documentSchema);
  orm.addSchema(vorgangDocumentSchema);
  try {
    await deleteTable();
  } catch {}
  await createTable();
  await createItems([
    ...documents.map(document => ({
      firstKey: `USER#${document.createdBy}`,
      secondKey: `DOCUMENT#${document.id}`,
      __model: documentSchema.model,
      ...document,
    })),
    ...vorgangDocuments.map(vorgangDocument => ({
      firstKey: `USER#${vorgangDocument.createdBy}`,
      secondKey: `DOCUMENT#${vorgangDocument.documentId}#VORGANG${vorgangDocument.vorgangId}`,
      __model: vorgangDocumentSchema.model,
      ...vorgangDocument,
    })),
  ]);
});

afterAll(() => deleteTable());

it('should return documents with hasMany association resolved', async () => {
  const documents = await documentRepository.findAllByUserId({ userId });
  expect(documents).toEqual([
    { ...document1, vorgaenge: [vorgangDocument1, vorgangDocument2] },
    { ...document2, vorgaenge: [vorgangDocument3] },
    { ...document3, vorgaenge: [vorgangDocument4] },
    { ...document4, vorgaenge: [vorgangDocument5] },
  ]);
});

it('should return documents with hasOne association resolved respecting vorgangId filter condition', async () => {
  const documents = await documentRepository.findAllByUserIdAndVorgangId({ userId, vorgangId: '1' });
  expect(documents).toEqual([
    { ...document1, vorgang: vorgangDocument1 },
    { ...document2, vorgang: vorgangDocument3 },
    { ...document3, vorgang: vorgangDocument4 },
    { ...document4, vorgang: vorgangDocument5 },
  ]);
});
