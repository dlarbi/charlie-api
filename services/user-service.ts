import { ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';
import { UserModel } from "../models/user";
import { AccountType, User } from './../types/types';
import { Password } from "../modules/password/Password";
import { GmailSend, MailOptions } from '../modules/gmail-send/GmailSend';
import { StripePaymentProcessor } from '../modules/stripe/stripe-payment-processor';
import { StripePriceIds, NoAccountTypeError } from '../constants/constants';
import { response } from 'express';

let userModel: UserModel;
(async () => {
    userModel = new UserModel()
    await userModel.connect();
})();

export class UserService {
    auth = async (email: string, password: string) => {
        console.log(`BEGIN UserService.auth`, email);
        const hash = await Password.hashPassword(password);

        const user = await this.findUserByEmail(email);
        const isValid = await Password.comparePassword(user.password, password);

        if (!isValid) {
            console.log(`ERROR UserService.auth Invalid password`,  email);
            throw new Error('Invalid password');
        }
        delete user.password;
        delete user.passwordResetToken;
        const token = jwt.sign(user, process.env.PUBKEY);
        console.log(`END UserService.auth`, email);
        return token;
    }

    requestResetPassword = async (email: string) => {
        const date = Date.now() + (24 * 60 * 60 * 1000);
        const expiryToken = { expiry: date };
        const token = jwt.sign(expiryToken, process.env.PUBKEY);
        const link = `https://app.willieai.com/reset-password/${token}`;
        const user = await this.findUserByEmail(email);

        user.passwordResetToken = token;
        user.passwordResetExpiry = date;
        await userModel.updateUser(user._id, user);

        const gmailSender = new GmailSend();
        gmailSender.setupOptions({
            to: email,
            from: 'dean@willieai.com',
            subject: 'Reset Password | WillieAi',
            text: `Hello ${email}, you have requested a reset password link.  Please ignore this email and contact customer service if this is in error.\n\n Your link: ${link}?email=${email}`
        });
        gmailSender.sendEmail();
    }

    resetPassword = async (token: string, email: string, password: string, password2: string): Promise<User> => {
        console.log(`BEGIN resetPassword`, token, email);
        const user = await this.findUserByEmail(email);
        console.log(`resetPassword for ${JSON.stringify(user)}`);

        if (password !== password2) {
            throw new Error('Passwords do not match');
        }

        // TODO: Use jwt.verify() to get the expiration out of the token, and remove the passwordResetExpiry property
        if(user.passwordResetToken !== token || user.passwordResetExpiry < Date.now()) {
            console.log(`ERROR UserService.resetPassword Token invalid or expired`,  email);
            throw new Error('Invalid token');
        }
        
        const newHash = await Password.hashPassword(password2);
        user.password = newHash;
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        const response = await userModel.updateUser(user._id, user);
        return response;
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
        const stripe = new StripePaymentProcessor();
        const customer = await stripe.createCustomer({ email });
        const user = { 
            email, 
            password, 
            roles: ['user'], 
            accountType: 'free', 
            stripeCustomerId: customer.id 
        };
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

    updateUser = async (user: User): Promise<User> => {
        console.log(`BEGIN UserService.updateUser`, user);
        delete user.password;
        let response: User;
        if (user._id) {
            response = await userModel.updateUser(new ObjectId(user._id), { ...user });
        } else {
            const existing: User = await userModel.getByEmail(user.email);
            response = await userModel.updateUser(new ObjectId(existing._id), { ...existing, ...user }); 
        }
        console.log(`END UserService.updateUser`, user);
        return response;
    }

    changeAccountType = async (userId: ObjectId, accountType: AccountType) => {
        const user = await this.findUserById(userId);
        user.accountType = accountType;
        
        const stripe = new StripePaymentProcessor();
        const paymentMethods = await stripe.getCustomerPaymentMethods(user.stripeCustomerId);
        if (!paymentMethods?.data[0]) {
            throw new Error(NoAccountTypeError);
        }
		const subscription = await stripe.subscribeCustomer(
            user.stripeCustomerId, 
            { 
                price: accountType === 'professional' ? 
                    StripePriceIds.Professional :
                    StripePriceIds.Enterprise,
            },
            paymentMethods.data[0].id,
        );
        
        const response = await userModel.updateUser((user._id), { ...user });
        console.log(`END changeAccountType ${JSON.stringify(user)}`)
        return user;
    }

    setUserAccountType = async (userId: ObjectId, accountType: AccountType) => {
        const user = await this.findUserById(userId);
        user.accountType = accountType;
        const response = await userModel.updateUser((user._id), { ...user });
        return user;
    }

    deleteUser = async (id: ObjectId): Promise<void> => {
        console.log(`BEGIN UserService.deleteUser`, id);
        await userModel.deleteUser(id);
        console.log(`END UserService.deleteUser`, id);
    }
}

