import { Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { registerUser } from '../routes/register/register-service.js';
import { getUserType } from '../routes/limits/limits-service.js';

export const isPremium = async (req: Request, res: Response, next) => {
  const user = req?.user;
  if (!user) {
    res.status(403).send();
    return;
  }

  let type = await getUserType(user.uid);
  if (!type) {
    await registerUser(user.uid, user.email);
    type = await getUserType(user.uid);
  }

  if (type === UserType.FREE) {
    res.sendStatus(403);
  } else {
    next();
  }
};
