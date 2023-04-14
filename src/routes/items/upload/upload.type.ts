import firebase from 'firebase-admin';

export type uploadPayload = {
  file: Express.Multer.File;
  user: firebase.auth.DecodedIdToken;
  tags: string[];
};
