import { LooseAuthProp, RequireAuthProp } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { UserType } from '@prisma/client';

export type SessionClaims = {
  roles: Array<keyof typeof UserType>;
};

type LooseAuthPropWithSessionClaims = {
  auth:
    | {
        userId: null;
        sessionClaims?: null;
      }
    | {
        userId: string;
        sessionClaims: SessionClaims;
      };
} & LooseAuthProp;

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
      DATABASE_URL: string;
      MOCK_UPLOADS: 'true' | 'false' | undefined;
    }
  }

  type ReqWithAuth = Request & RequireAuthProp;

  namespace Express {
    interface Request extends LooseAuthPropWithSessionClaims {}
  }
}
