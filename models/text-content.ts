// @ts-nocheck
import { MongoClient, Db, Collection } from 'mongodb';
import { RatedTextContent } from './../types/types';

export class TextContentModel {
    db: Db;
    collection: Collection;
    async __constructor() {
        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('textContent');
    }

    async getAll(): Promise<RatedTextContent[]> {
        const textContent = await this.collection.find().toArray();
        return textContent;
    }
    
    async getById(id: string): Promise<RatedTextContent> {  
        const textContent = await this.collection.findOne({ _id: id });
        return textContent;
    }
    
    async getByRatingId(ratingId: string): Promise<RatedTextContent> {
        const textContent = await this.collection.findOne({ 'rating.id': ratingId });
        return textContent;
    }
    
    async saveRatedTextContent(textContent: RatedTextContent): Promise<string> {
        const savedRatedTextContent = await this.collection.insertOne(textContent);
        return savedRatedTextContent.insertedId;
    }
    
    async saveRatedTextContents(textContents: RatedTextContent[]): Promise<string[]> {
        const savedRatedTextContents = await this.collection.insertMany(textContents);
        return savedRatedTextContents.insertedIds;
    }
    
    async updateRatedTextContent(id: string, textContent: RatedTextContent): Promise<void> {
        await this.collection.updateOne({ _id: id }, { $set: textContent });
    }
    
    async deleteRatedTextContent(id: string): Promise<void> {
      await this.collection.deleteOne({ _id: id });
    }
}
