//@ts-nocheck
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { User } from './../types/types';

export class UserModel {
    db: Db;
    collection: Collection;
    connect = async () => {
        const client = new MongoClient();
        await client.connect(process.env.MONGO_DB_URL, {
          tlsCAFile: 'rds-combined-ca-bundle.pem'
        });
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('user');
    }

    async getAll(): Promise<User[]> {
        const user = await this.collection.find().toArray();
        return user;
    }
    
    async getById(id: ObjectId): Promise<User> {  
        const user = await this.collection.findOne({ _id: id });
        return user;
    }
    
    async getByEmail(email: string): Promise<User> {
        const user = await this.collection.findOne({ email });
        return user;
    }
    
    async saveUser(user: User): Promise<ObjectId> {
        const savedUser = await this.collection.insertOne(user);
        return savedUser.insertedId;
    }
    
    async saveUsers(users: User[]): Promise<ObjectId[]> {
        const savedUsers = await this.collection.insertMany(users);
        return Object.keys(savedUsers.insertedIds).map(key => savedUsers.insertedIds[key]);
    }
    
    async updateUser(id: ObjectId, user: User): Promise<void> {
        await this.collection.updateOne({ _id: id }, { $set: user });
    }
    
    async deleteUser(id: ObjectId): Promise<void> {
      await this.collection.deleteOne({ _id: id });
    }
}
