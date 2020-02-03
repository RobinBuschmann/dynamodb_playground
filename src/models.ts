/*

Person
---

@HasMany writtenBooks
@HasMany proofedBooks

Book
---

@ForeignKey authorId
@ForeignKey proofReaderId


 */
const Entity = (...args: any[]) => target => {};
const HasMany = (...args: any[]) => (target, propertyKey) => {};
const BelongsTo = (...args: any[]) => (target, propertyKey) => {};
const Attribute = (...args: any[]) => (target, propertyKey) => {};

@Entity()
export class User {
  @Attribute()
  id!: string;

  @Attribute()
  email!: string;

  @HasMany(type => Document)
  documents!: Document[];
}

@Entity()
export class Document {
  @Attribute()
  id!: string;

  @Attribute()
  email!: string;

  @BelongsTo(type => User)
  uploadedBy!: User;
}

