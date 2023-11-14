import { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';

export const forRole =
  (role: keyof typeof UserType) => (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.userId && req.auth.sessionClaims.roles.includes(role)) {
      next();
    } else {
      res.status(403).send();
    }
  };
