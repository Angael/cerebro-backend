import { Knex } from 'knex';
import { AccountType, IAccount } from '../src/models/IAccount';

const getUid = (num) =>
  Array.from({ length: 30 }).reduce((acc, v, i) => `${acc}${num}`, '') as string;

export async function seed(knex: Knex): Promise<void> {
  console.log('[accounts seed]');

  const accounts: IAccount[] = [
    {
      uid: getUid(1),
      email: 'admin@test.test',
      name: 'admin username',
      type: AccountType.admin,
    },
    {
      uid: getUid(2),
      email: 'premium@test.test',
      name: 'premium username',
      type: AccountType.premium,
    },
    {
      uid: getUid(3),
      email: 'standard@test.test',
      name: 'standard username',
      type: AccountType.standard,
    },
    {
      uid: 'Se561raFjoSjJY5Q7kZtwoIHk4H2',
      email: 'user@user.com',
      name: 'Test user',
      type: AccountType.admin,
    },
  ];

  // Inserts seed entries
  await knex('account').insert(accounts);
}
