import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request, Response, NextFunction } from 'express';

// TODO: better than ClerkExpressRequireAuth ?
export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { isSignedIn, toAuth } = await clerkClient.authenticateRequest({ request: req });

  if (!isSignedIn) {
    res.status(403).send();
  } else {
    const auth = toAuth();
    const { sessionId } = auth;
    const session = await clerkClient.sessions.getToken(sessionId, template);

    // TODO:  tu sie zaczyna temat jwt templates, chyba nie potrzebne? Mi przeszkadza tylko ze jakies claims nie istnieja i typ sie nie zgadza z tym co daje ClerkExpressRequireAuth

    next();
  }
};
