// @ts-nocheck
import { MongoClient, Db, Collection } from 'mongodb';
import { RatedTextContent } from './../types/types';

const noProjectIdException = () => {
  return new Error('Cannot save TextContent without a projectId');
}

export class TextContentModel {
    db: Db;
    collection: Collection;

    connect = async () => {
        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('textContent');
    }

    getAll = async (): Promise<RatedTextContent[]> => {
        const textContent = await this.collection.find().toArray();
        return textContent;
    }
    
    getById = async (id: string): Promise<RatedTextContent> => {  
        const textContent = await this.collection.findOne({ _id: id });
        return textContent;
    }
    
    getByRatingId = async (ratingId: string): Promise<RatedTextContent> => {
        const textContent = await this.collection.findOne({ 'rating.id': ratingId });
        return textContent;
    }

    getByUrlAndProjectId = async (url: string, projectId: string): Promise<RatedTextContent> => {
      const textContent = await this.collection.findOne({ url, projectId });
      return textContent;
    }
    
    saveRatedTextContent = async (textContent: RatedTextContent): Promise<string> => {
        if (!textContent.projectId) {
            throw noProjectIdException();
        }

        const savedRatedTextContent = this.collection.insertOne(textContent);
        return savedRatedTextContent.insertedId;
    }

    updateRatedTextContentByUrlAndProjectId = async (textContent: RatedTextContent): Promise<void> => {
      if (!textContent.projectId) {
        throw noProjectIdException();
      }

      await this.collection.updateOne({ 
        url: textContent.url, 
        projectId: textContent.projectId 
      }, { $set: textContent });
    }
    
    updateRatedTextContent = async (textContent: RatedTextContent): Promise<void> => {
        if (!textContent.projectId) {
          throw noProjectIdException();
        }
        await this.collection.updateOne({ _id: textContent._id }, { $set: textContent });
    }
    
    deleteRatedTextContent = async (id: string): Promise<void> => {
      await this.collection.deleteOne({ _id: id });
    }
}
