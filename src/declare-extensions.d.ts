// https://stackoverflow.com/questions/39853825/how-to-extend-an-interface-declared-in-an-external-library-d-ts/44828876
import firebase from 'firebase-admin';

declare module 'express' {
  export interface Request {
    user?: firebase.auth.DecodedIdToken;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      AWS_USER: string;
      AWS_KEY: string;
      AWS_SECRET: string;
      AWS_BUCKET_NAME: string;
      AWS_REGION: string;
      FB_PROJECT_ID: string;
      FB_KEY: string;
      FB_EMAIL: string;
      DATABASE_URL: string;
      MOCK_UPLOADS: 'true' | 'false' | undefined;
    }
  }
}
