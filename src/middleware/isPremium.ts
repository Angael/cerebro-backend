import { Request, Response } from 'express';
import { AccountType } from '../models/IAccount.js';
import { DB_TABLE } from '../utils/consts.js';
import { db } from '../db/db.js';
import { registerUser } from '../routes/register/register-service.js';

export const isPremium = async (req: Request, res: Response, next) => {
  const user = req?.user;
  if (!user) {
    res.status(403).send();
    return;
  }

  const getAccountType = () => db.select('type').from(DB_TABLE.account).where({ uid: user.uid });

  let firstRow = (await getAccountType())[0];
  if (!firstRow) {
    await registerUser(user.uid, user.email);
    firstRow = (await getAccountType())[0];
  }

  const type = firstRow.type;

  if (type === AccountType.free) {
    res.sendStatus(403);
  } else {
    next();
  }
};
