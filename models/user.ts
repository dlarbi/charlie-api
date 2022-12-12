// @ts-nocheck
import { MongoClient, Db, Collection } from 'mongodb';
import { User } from './../types/types';

export class UserModel {
    db: Db;
    collection: Collection;
    connect = async () => {
        const client = new MongoClient(process.env.MONGO_DB_URL);
        await client.connect();
        this.db = client.db(process.env.MONGO_DB_NAME);
        this.collection = this.db.collection('user');
    }

    async getAll(): Promise<User[]> {
        const user = await this.collection.find().toArray();
        return user;
    }
    
    async getById(id: string): Promise<User> {  
        const user = await this.collection.findOne({ _id: id });
        return user;
    }
    
    async getByEmail(email: string): Promise<User> {
        const user = await this.collection.findOne({ email });
        return user;
    }
    
    async saveUser(user: User): Promise<string> {
        const savedUser = await this.collection.insertOne(user);
        return savedUser.insertedId;
    }
    
    async saveUsers(users: User[]): Promise<string[]> {
        const savedUsers = await this.collection.insertMany(users);
        return savedUsers.insertedIds;
    }
    
    async updateUser(id: string, user: User): Promise<void> {
        await this.collection.updateOne({ _id: id }, { $set: user });
    }
    
    async deleteUser(id: string): Promise<void> {
      await this.collection.deleteOne({ _id: id });
    }
}
