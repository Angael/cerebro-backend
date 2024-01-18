import { prisma } from '../../db/db.js';
import { userTypeCache } from '../../cache/userCache.js';
import { UserType } from '@prisma/client';

// TODO: IMPORTANT use in a future webhook
export async function registerUser(uid: string, email: string) {
  try {
    prisma.user.create({
      data: {
        uid,
        email,
        type: UserType.FREE,
      },
    });
    userTypeCache.del(uid);
    return;
  } catch {
    throw new Error('Failed to add this account');
  }
}
