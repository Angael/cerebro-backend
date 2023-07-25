import { prisma } from '../../db/db.js';
import { userTypeCache } from '../../cache/userCache.js';
import { UserType } from '@prisma/client';
import logger from '../../utils/log.js';

export async function registerUser(uid: string, email: string) {
  try {
    logger.verbose(`registerUser ${uid} ${email}`);

    await prisma.user.create({
      data: {
        uid,
        email,
        type: UserType.FREE,
      },
    });
    userTypeCache.del(uid);
    return;
  } catch (e) {
    logger.error(`Error registerUser ${e.message}`);
    throw new Error('Failed to add this account');
  }
}
