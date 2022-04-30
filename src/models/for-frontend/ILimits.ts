import { AccountType } from '../IAccount';

export interface ILimits {
  type: AccountType;
  bytes: {
    used: number;
    max: number;
  };
}
