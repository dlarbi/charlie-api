import { UserModel } from "../models/user";
import { User } from './../types/types';
const userModel = new UserModel();

export class UserService {
    async createUser(email: string) {
        console.log(`BEGIN createUser`, email);
        const response = await userModel.saveUser({ email });
        console.log(`END createUser`, email);
        return response;
    }

    async updateUser(id?: string, email?: string) {
        console.log(`BEGIN createUser`, email);
        let response: void;
        if (id) {
            response = await userModel.updateUser(id, { email });
        } else {
            const user: User = await userModel.getByEmail(email);
            response = await userModel.updateUser(user._id, { email }); 
        }
        console.log(`END createUser`, email);
        return response;
    }
}