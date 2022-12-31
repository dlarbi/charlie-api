import { ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';
import { UserModel } from "../models/user";
import { User } from './../types/types';
import { Password } from "../modules/password/Password";
import { GmailSend, MailOptions } from '../modules/gmail-send/GmailSend';

let userModel: UserModel;
(async () => {
    userModel = new UserModel()
    await userModel.connect();
})();

export class UserService {
    auth = async (email: string, password: string) => {
        console.log(`BEGIN UserService.auth`, email);
        const hash = await Password.hashPassword(password);
        const isValid = await Password.comparePassword(hash, password);

        if (!isValid) {
            console.log(`ERROR UserService.auth Invalid password`,  email);
            throw new Error('Invalid password');
        }
        const user = await this.findUserByEmail(email);
        const token = jwt.sign(user, process.env.PUBKEY);
        console.log(`END UserService.auth`, email);
        return token;
    }

    findUserById = async (id: ObjectId): Promise<User> => {
        console.log(`BEGIN UserService.findUserById`, id);
        const response = await userModel.getById(id);
        console.log(`END UserService.findUserById`, id);
        return response;
    }

    findUserByEmail = async (email: string): Promise<User> => {
        console.log(`BEGIN UserService.findUserByEmail`, email);
        const response = await userModel.getByEmail(email);
        console.log(`END UserService.findUserByEmail`, email);
        return response;
    }

    createUser = async (email: string, password: string): Promise<User> => {
        console.log(`BEGIN UserService.createUser`, email);
        const existing = await this.findUserByEmail(email);
        if (existing) {
            throw new Error(`${email} is an existing user.  New user not created.`);
        }
        const user = { email, password, roles: ['user'] };
        await userModel.saveUser(user);
        const token = jwt.sign(user, process.env.PUBKEY);

        const response = await this.findUserByEmail(email);

        const gmailSender = new GmailSend();
        gmailSender.setupOptions({
            to: email,
            from: 'dean@willieai.com',
            subject: 'Welcome to WillieAi!',
            text: `Hello ${email}, You have successfully created your account.  Login at willieai.com to start asking Willie to analyse your content!`
        });
        gmailSender.sendEmail();
        console.log(`END UserService.createUser`, email);
        return { ...response, token };
    }

    updateUser = async (id?: ObjectId, email?: string): Promise<void> => {
        console.log(`BEGIN UserService.updateUser`, email);
        let response: void;
        if (id) {
            response = await userModel.updateUser(id, { email });
        } else {
            const user: User = await userModel.getByEmail(email);
            response = await userModel.updateUser(user._id, { email }); 
        }
        console.log(`END UserService.updateUser`, email);
        return response;
    }

    deleteUser = async (id: ObjectId): Promise<void> => {
        console.log(`BEGIN UserService.deleteUser`, id);
        await userModel.deleteUser(id);
        console.log(`END UserService.deleteUser`, id);
    }
}

