import { MongoClient, Db } from 'mongodb';
import { RatedTextContent } from './../types/types';

async function getAll(): Promise<RatedTextContent[]> {
  const client = new MongoClient(process.env.MONGO_DB_URL);
  await client.connect();

  const db: Db = client.db(process.env.MONGO_DB_NAME);
  const textContentCollection = db.collection('textContent');

  const textContent = await textContentCollection.find().toArray();

  client.close();

  return textContent;
}

async function getById(id: string): Promise<RatedTextContent> {
    const client = new MongoClient(process.env.MONGO_DB_URL);
    await client.connect();
  
    const db: Db = client.db(process.env.MONGO_DB_NAME);
    const textContentCollection = db.collection('textContent');
  
    const textContent = await textContentCollection.findOne({ _id: id });
  
    client.close();
  
    return textContent;
}

async function getByRatingId(ratingId: string): Promise<RatedTextContent> {
    const client = new MongoClient(process.env.MONGO_DB_URL);
    await client.connect();
  
    const db: Db = client.db(process.env.MONGO_DB_NAME);
    const textContentCollection = db.collection('textContent');
  
    const textContent = await textContentCollection.findOne({ 'rating.id': ratingId });
  
    client.close();
  
    return textContent;
}

async function saveRatedTextContent(textContent: RatedTextContent): Promise<string> {
  const client = new MongoClient(process.env.MONGO_DB_URL);
  await client.connect();

  const db: Db = client.db(process.env.MONGO_DB_NAME);
  const textContentCollection = db.collection('textContent');

  const savedRatedTextContent = await textContentCollection.insertOne(textContent);

  client.close();

  return savedRatedTextContent.insertedId;
}

async function updateRatedTextContent(id: string, textContent: RatedTextContent): Promise<void> {
  const client = new MongoClient(process.env.MONGO_DB_URL);
  await client.connect();

  const db: Db = client.db(process.env.MONGO_DB_NAME);
  const textContentCollection = db.collection('textContent');

  await textContentCollection.updateOne({ _id: id }, { $set: textContent });

  client.close();
}

async function deleteRatedTextContent(id: string): Promise<void> {
  const client = new MongoClient(process.env.MONGO_DB_URL);
  await client.connect();

  const db: Db = client.db(process.env.MONGO_DB_NAME);
  const textContentCollection = db.collection('textContent');

  await textContentCollection.deleteOne({ _id: id });

  client.close();
}