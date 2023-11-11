import { NextFunction, Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { getUserType } from '../routes/limits/limits-service.js';

export const isPremium = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req?.auth;
  if (!auth?.userId) {
    res.status(403).send();
    return;
  }

  let type = await getUserType(auth.userId);

  if (type === UserType.FREE) {
    res.sendStatus(403);
  } else {
    next();
  }
};
