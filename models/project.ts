// @ts-nocheck

import mongoose from 'mongoose';
import { MongoClient, Db, Collection } from 'mongodb';
import { Project } from './../types/types';

const noUrlException = () => {
  return new Error('Cannot save Project without a url');
}

const noDuplicateProjectUrlException = () => {
    return new Error('Cannot save Project with the same url as another Project');
}

const ProjectSchema = new mongoose.Schema({
  _id: { type: String, required: false },
  userId: { type: String, required: true }
});

export class ProjectModel {
    db: Db;
    collection: Collection;
    
    connect = async () => {
        // TODO: Finish up mongoose
        // await mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`);

        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('project');
    }

    getAll = async (): Promise<Project[]> => {
        const projects = await this.collection.find().toArray();
        return projects;
    }
    
    getById = async (id: ObjectId): Promise<Project> => {  
        const project = await this.collection.findOne({ _id: String(id) });
        console.log(project, 'got by id')
        return project;
    }

    getByUrlAndUserId = async (url: string, userId: ObjectId): Promise<Project> => {  
        const project = await this.collection.findOne({ url, userId });
        return project;
    }

    getByUserId = async (userId: string): Promise<Project[]> => {
        const projects = await this.collection.find({ userId }).toArray();
        return projects;
    }
    
    saveProject = async (project: Project): Promise<Project> => {
        if (!project.url) {
            throw noUrlException();
        }

        const existing = await this.getByUrlAndUserId(project.url, project.userId);
        console.log(existing, 'existing');
        if (existing) {
            throw noDuplicateProjectUrlException();
        }
        const saved = await this.collection.insertOne(project);
        console.log(saved, 'saved', saved.insertedId)
        const result = await this.getById(saved.insertedId);
        return result;
      }

 
    updateProject = async (project: Project): Promise<Project> => {
        if (!project.url) {
            throw noUrlException();
        }
        await this.collection.updateOne({ _id: project._id }, { $set: project });
        const result = await this.getByUrlAndUserId(project.url, project.userId);

        return result;
    }
    
    deleteProject = async (id: ObjectId): Promise<void> => {
      await this.collection.deleteOne({ _id: id });
    }
}
