import { NextFunction, Response } from 'express';
import { UserType } from '@prisma/client';

export const isPremium = (req: ReqWithAuth, res: Response, next: NextFunction) => {
  if (req.auth?.userId && req.auth?.sessionClaims.roles.includes(UserType.PREMIUM)) {
    next();
  } else {
    res.status(403).send();
  }
};
