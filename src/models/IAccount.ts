export enum AccountType {
  free = 'free',
  standard = 'standard',
  premium = 'premium',
  admin = 'admin',
}

export interface IAccount {
  uid: string;
  email: string;
  name?: string;
  type: AccountType;
  created_at?: string; // ISO
}
