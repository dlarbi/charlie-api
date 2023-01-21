//@ts-nocheck
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Project, ProjectJob } from '../types/types';

export class ProjectJobModel {
    db: Db;
    collection: Collection;
    connect = async () => {
        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('project_job');
    }

    async save(project: Project): Promise<ProjectJob> {
        let result;
        if (project._id) {
            // retart this existing job 
        } else {
            // create a new job 
        }
        return result;

    }

    async getAll(): Promise<ProjectJob[]> {
        const projectJob = await this.collection.find().toArray();
        return projectJob;
    }
    
    async getById(id: ObjectId): Promise<ProjectJob> {  
        const projectJob = await this.collection.findOne({ _id: id });
        return projectJob;
    }
    
 
}
