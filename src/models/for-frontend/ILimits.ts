import { AccountType } from '../IAccount.js';

export interface ILimits {
  type: AccountType;
  bytes: {
    used: number;
    max: number;
  };
}
