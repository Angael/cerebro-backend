import { Request, Response } from 'express';
import { AccountType } from '../models/IAccount.js';
import { DB_TABLE } from '../utils/consts.js';
import { db } from '../db/db.js';

export const isPremium = async (req: Request, res: Response, next) => {
  const user = req?.user;
  if (!user) {
    res.status(403).send();
    return;
  }

  const result = await db.select('type').from(DB_TABLE.account).where({ uid: user.uid });
  const firstRow = result[0];

  const type = firstRow.type;

  if (type !== AccountType.free) {
    next();
  }
};
