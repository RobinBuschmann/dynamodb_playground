import {DynamoDB} from 'aws-sdk';

const dynamoDB = new DynamoDB({
  credentials: {accessKeyId: 'none', secretAccessKey: 'none'},
  endpoint: 'http://localhost:8000',
  region: 'eu-central-1',
});


const main = async () => {
  try {
    const userRepository = createRepository({}, 'MyApp', {
      getByEmail: ({email}) => ({
        indexName: 'GSI1',
        keyConditionExpression: 'secondKey = :secondKey',
        expressionAttributeValues: {
          ':secondKey': `USER#${email}`,
        },
        multi: false,
      }),
      getById: ({id}) => ({
        keyConditionExpression: 'firstKey = :firstKey',
        expressionAttributeValues: {
          ':firstKey': `USER#${id}`,
        },
        multi: false,
      }),
    });

    // await createUser({id: 1, email: 'rob@email.de'});
    const user = await userRepository.getByEmail({email: 'rob@email.de'});

    // const result = await dynamoDB.query({
    //   TableName: 'MyApp',
    //   KeyConditionExpression: 'firstKey = :firstKey AND begins_with(secondKey, :partialSecondKey)',
    //   // FilterExpression: ``,
    //   ExpressionAttributeValues: DynamoDB.Converter.marshall(
    //     {
    //       ':firstKey': 'USER#1',
    //       ':partialSecondKey': 'USER',
    //     }
    //   ),
    // }).promise();
    //
    // console.log(result.Items.map(item => DynamoDB.Converter.unmarshall(item)));
    console.log(user);
  } catch (e) {
    console.error(e);
  }

};

const createRepository = (entityModel: any, tableName: string, queries: any) => Object
  .entries(queries)
  .reduce((acc, [name, getParams]: [any, any]) => ({
    ...acc,
    [name]: (...args) => {
      const {indexName, keyConditionExpression, expressionAttributeValues, multi} = getParams(...args);
      return dynamoDB
        .query({
          TableName: tableName,
          IndexName: indexName,
          KeyConditionExpression: keyConditionExpression,
          ExpressionAttributeValues: DynamoDB.Converter.marshall(expressionAttributeValues),
        })
        .promise()
        .then(result => {
          const mappedItems = result.Items.map(item => DynamoDB.Converter.unmarshall(item));
          return multi ? mappedItems : mappedItems[0];
        });
    }
  }), {} as any);

createRepository(Object, 'tableName', {
  getByEmail: ({email}) => ({
    indexName: 'GSI1',
    keyConditionExpression: 'firstKey = :firstKey AND begins_with(secondKey, :partialSecondKey)',
    expressionAttributeValues: {

    }
  })
});

const getByEmail = ({email}) => dynamoDB.query({
  TableName: 'MyApp',
  IndexName: 'GSI1',
  KeyConditionExpression: 'secondKey = :secondKey',
  ExpressionAttributeValues: DynamoDB.Converter.marshall(
    {
      ':secondKey': `USER#${email}`,
    }
  ),
}).promise();

const deleteItem = ({id, email}) => dynamoDB.deleteItem({
  TableName: 'MyApp',
  Key: DynamoDB.Converter.marshall(
    {
      firstKey: `USER#${id}`,
      secondKey: `USER#${email}`,
    }
  ),
}).promise();

const createUser = ({id, email}) => dynamoDB.putItem({
  TableName: 'MyApp',
  Item: DynamoDB.Converter.marshall(
    {
      firstKey: `USER#${id}`,
      secondKey: `USER#${email}`,
      email,
    }
  ),
}).promise();

const createDocument = ({userId, documentId, filename}) => dynamoDB.putItem({
  TableName: 'MyApp',
  Item: DynamoDB.Converter.marshall(
    {
      firstKey: `USER#${userId}`,
      secondKey: `DOCUMENT#${documentId}`,
      filename,
    }
  ),
}).promise();

const createTable = () => dynamoDB.createTable({
  TableName: 'MyApp',
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  AttributeDefinitions: [
    {
      AttributeName: 'firstKey',
      AttributeType: 'S',
    },
    {
      AttributeName: 'secondKey',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'firstKey',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'secondKey',
      KeyType: 'RANGE',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'GSI1',
      KeySchema: [
        {
          AttributeName: 'secondKey',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'firstKey',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      }
    }
  ],
}).promise();


main();
