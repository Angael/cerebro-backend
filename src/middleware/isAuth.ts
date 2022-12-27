import { Request, Response } from 'express';

export const isAuth = async (req: Request, res: Response, next) => {
  const user = req?.user;
  if (!user) {
    res.status(403).send();
    return;
  }
  next();
};
