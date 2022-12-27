import { GB, MB } from './consts.js';
import { AccountType } from '../models/IAccount.js';

export const limitsConfig = {
  [AccountType.free]: 0,
  [AccountType.standard]: 100 * MB,
  [AccountType.premium]: 1 * GB,
  [AccountType.admin]: 1 * GB,
};
