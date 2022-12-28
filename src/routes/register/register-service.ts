import { db } from '../../db/db.js';
import { DB_TABLE } from '../../utils/consts.js';
import { AccountType, IAccount } from '../../models/IAccount.js';

export async function registerUser(uid: string, email: string) {
  const account: IAccount = {
    uid,
    email,
    type: AccountType.free,
  };

  try {
    await db.insert(account).into(DB_TABLE.account);
    return;
  } catch {
    throw new Error('Failed to add this account');
  }
}