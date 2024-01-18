import { UserJSON } from '@clerk/clerk-sdk-node';
import logger from '../../utils/log.js';
import { User } from '../../models/User.js';

export async function userCreated(data: UserJSON) {
  const { id, email_addresses } = data;

  const email: string | undefined = email_addresses[0]?.email_address;

  try {
    await User.afterCreate(id, email);

    return;
  } catch (e) {
    logger.error('Failed to add account %s', id);
    console.log(e);
    throw new Error(e);
  }
}
