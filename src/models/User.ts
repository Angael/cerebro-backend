import { SessionClaims } from '../declare-extensions.js';
import { UserType } from '@prisma/client';
import { prisma } from '../db/db.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// This class exists, because publicMetadata
export abstract class User {
  static async afterCreate(id, email) {
    const prismaUserData = {
      uid: id,
      email,
      type: UserType.FREE,
    };

    return Promise.all([
      clerkClient.users.updateUser(id, {
        publicMetadata: {
          roles: [UserType.PREMIUM],
        } satisfies SessionClaims,
      }),
      prisma.user.upsert({
        create: prismaUserData,
        update: prismaUserData,
        where: { uid: id },
      }),
    ]);
  }
}
