// @ts-nocheck

import mongoose from 'mongoose';
import { MongoClient, Db, Collection } from 'mongodb';
import { TextContent } from './../types/types';

const noProjectUrlException = () => {
  return new Error('Cannot save TextContent without a projectUrl');
}

const TextContentSchema = new mongoose.Schema({
  _id: { type: String, required: false },
  projectUrl: { type: String, required: true },
  children: { type: Array, required: false },
  title: { type: String, required: false },
  text: { type: String, required: true },
  rating: { type: Object, required: true },
  url: { type: String, required: false },
  analysedAt: { type: [Date, String], required: true },
  createdAt: { type: [Date, String], required: false },
  isIgnored: { type: Boolean, required: false }
});

export class TextContentModel {
    db: Db;
    collection: Collection;
    
    connect = async () => {
        // TODO: Finish up mongoose
        // await mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`);

        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('textContent');
    }

    getAll = async (): Promise<TextContent[]> => {
        const textContent = await this.collection.find().toArray();
        return textContent;
    }
    
    getById = async (id: ObjectId): Promise<TextContent> => {  
        const textContent = await this.collection.findOne({ _id: id });
        return textContent;
    }
    
    getByRatingId = async (ratingId: string): Promise<TextContent> => {
        const textContent = await this.collection.findOne({ 'rating.id': ratingId });
        return textContent;
    }

    getByUrlAndProjectUrl = async (url: string, projectUrl: string): Promise<TextContent> => {
      const textContent = await this.collection.findOne({ url, projectUrl });
      return textContent;
    }

    getByProjectUrl = async (projectUrl: string): Promise<TextContent[]> => {
        const textContents = await this.collection.find({ projectUrl }).toArray();
        return textContents;
    }
    
    saveTextContent = async (textContent: TextContent): Promise<TextContent> => {
        if (!textContent.projectUrl) {
            throw noProjectUrlException();
        }

        await this.collection.insertOne(textContent);
        const result = await this.getByUrlAndProjectUrl(textContent.url, textContent.projectUrl);
        return result;
      }

    updateTextContentByUrlAndProjectUrl = async (textContent: TextContent): Promise<TextContent> => {
      if (!textContent.projectUrl) {
        throw noProjectUrlException();
      }

      await this.collection.updateOne({ 
        url: textContent.url, 
        projectUrl: textContent.projectUrl 
      }, { $set: textContent });
      const result = await this.getByUrlAndProjectUrl(textContent.url, textContent.projectUrl);
      return result;
    }
    
    updateTextContent = async (textContent: TextContent): Promise<TextContent> => {
        if (!textContent.projectUrl) {
          throw noProjectUrlException();
        }
        await this.collection.updateOne({ _id: textContent._id }, { $set: textContent });
        const result = await this.getByUrlAndProjectUrl(textContent.url, textContent.projectUrl);

        return result;
    }
    
    deleteTextContent = async (id: ObjectId): Promise<void> => {
      await this.collection.deleteOne({ _id: id });
    }
}
