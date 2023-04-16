import firebase from 'firebase-admin';
import { Tag } from '@prisma/client';

export type uploadPayload = {
  file: Express.Multer.File;
  user: firebase.auth.DecodedIdToken;
  tags: Tag[];
};
