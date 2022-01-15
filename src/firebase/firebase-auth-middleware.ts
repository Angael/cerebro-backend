import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import firebase from './firebase-params';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
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
  }
}
