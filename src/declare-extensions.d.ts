import { LooseAuthProp, RequireAuthProp } from '@clerk/clerk-sdk-node';
import { SignedInAuthObject } from '@clerk/backend/dist/types/tokens/authObjects.js';
import { Request } from 'express';

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

  type ReqWithAuth = Request & RequireAuthProp;

  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}
