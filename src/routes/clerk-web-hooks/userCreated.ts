import { prisma } from '../../db/db.js';
import { UserType } from '@prisma/client';
import { userTypeCache } from '../../cache/userCache.js';
import { UserJSON } from '@clerk/clerk-sdk-node';
import logger from '../../utils/log.js';

export async function userCreated(data: UserJSON) {
  const { id, email_addresses } = data;

  const email: string | undefined = email_addresses[0]?.email_address;

  try {
    await prisma.user.create({
      data: {
        uid: id,
        email,
        type: UserType.FREE,
      },
    });

    userTypeCache.del(id);
    return;
  } catch {
    logger.error('Failed to add account %s', id);
    throw new Error();
  }
}
