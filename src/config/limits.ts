import { GB, MB } from '../utils/consts';
import { AccountType } from '../models/IAccount';

export const limitsConfig = {
  [AccountType.free]: 0,
  [AccountType.standard]: 100 * MB,
  [AccountType.premium]: 1 * GB,
  [AccountType.admin]: 1 * GB,
};
