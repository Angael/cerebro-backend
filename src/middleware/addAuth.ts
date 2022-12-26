import { NextFunction, Request, Response } from 'express';
import firebase from '../firebase/firebase-params.js';

export const addAuth = (req: Request, res: Response, next: NextFunction) => {
  let token = req.get('Authorization');

  if (token) {
    token = token.replace('Bearer ', '');

    firebase
      .auth()
      .verifyIdToken(token)
      .then((decodedToken: firebase.auth.DecodedIdToken) => {
        req['user'] = decodedToken;
        next();
      })
      .catch((error) => {
        res.status(401).send('Bad token');
      });
  } else {
    next();
  }
};
