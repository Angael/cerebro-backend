import firebase from 'firebase-admin';
import { Request } from 'express';
import { HttpError } from './errors/HttpError.js';

interface RequestWithUser extends Request {
  user: firebase.auth.DecodedIdToken;
}

export function assertUser(req: any): asserts req is RequestWithUser {
  if (!req.user) {
    throw new HttpError(403);
  }
}
