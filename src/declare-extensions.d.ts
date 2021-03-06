// https://stackoverflow.com/questions/39853825/how-to-extend-an-interface-declared-in-an-external-library-d-ts/44828876
import firebase from 'firebase-admin';

declare module 'express' {
  export interface Request {
    user?: firebase.auth.DecodedIdToken;
  }
}
