class User {
}

class Dokument {
}

class SharedDocument {
}

export const schemas = {
  SharedDocument: {
    entityClass: SharedDocument,
    primaryKeys: ['documentId', 'userId'],
    references: [
      {foreignKey: 'documentId', model: 'Document'},
      {foreignKey: 'userId', model: 'User'},
    ],
    attributes: [
      {key: 'shareState'},
    ],
  },
  User: {
    model: 'User',
    entityClass: User,
    primaryKeys: ['id'],
    associations: [
      {
        target: 'Document',
        key: 'documents',
        foreignKey: 'userId',
        type: 'hasMany',
      },
      {
        target: 'Book',
        key: 'writtenBooks',
        foreignKey: 'authorId',
        type: 'hasMany',
      },
      {
        target: 'Book',
        key: 'proofedBooks',
        foreignKey: 'proofReaderId',
        type: 'hasMany',
      },
      {
        target: 'Document',
        through: 'SharedDocument',
        key: 'sharedDocuments',
        foreignKey: 'userId',
        type: 'belongsToMany',
      }
    ],
    attributes: [
      {key: 'id'},
      {key: 'email'},
    ],
  },
  Document: {
    model: 'Document',
    entityClass: Dokument,
    primaryKeys: ['id'],
    references: [
      {
        model: 'User',
        foreignKey: 'userId',
      }
    ],
    // associations: {
    //   SharedDocument: [
    //     {
    //       key: 'sharedWith',
    //       foreignKey: 'documentId',
    //       type: 'belongsToMany',
    //     }
    //   ],
    // },
    attributes: [
      {key: 'id'},
      {key: 'userId'},
      {key: 'filename'},
    ],
  },
  Book: {
    model: 'Book',
    primaryKeys: ['id'],
    references: [
      {
        model: 'User',
        foreignKey: 'authorId',
      },
      {
        model: 'User',
        foreignKey: 'proofReaderId',
      }
    ],
    // associations: {},
    attributes: [
      {key: 'id'},
      {key: 'authorId'},
      {key: 'proofReaderId'},
      {key: 'title'},
    ],
  }
};
