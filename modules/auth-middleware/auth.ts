import * as express from 'express';
import { User } from '../../types/types';
import * as jwt from 'jsonwebtoken';

export interface IGetUserAuthInfoRequest extends express.Request {
  user: User // or any other type
}

export const auth = (req: IGetUserAuthInfoRequest, res: express.Response, next) => {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, process.env.PUBKEY, (err: unknown, decoded: any) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    req.user = decoded;
    next();
  });
}