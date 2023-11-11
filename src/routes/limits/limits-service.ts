import { limitsConfig } from '../../utils/limits.js';
import { prisma } from '../../db/db.js';
import { usedSpaceCache, userTypeCache } from '../../cache/userCache.js';
import { UserType } from '@prisma/client';
import { MyFile } from '../items/upload/upload.type.js';

export const getSpaceUsedByUser = async (uid: string): Promise<number> => {
  let used: number;
  if (usedSpaceCache.has(uid)) {
    used = usedSpaceCache.get(uid) as number;
  } else {
    const items = await prisma.item.findMany({
      where: { userUid: uid },
      include: {
        Image: true,
        Video: true,
        thumbnails: true,
      },
    });

    used = items.reduce((_sum, item) => {
      const imagesSize = item.Image.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      const videoSize = item.Video.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      const thumbnailsSize = item.thumbnails.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      return _sum + imagesSize + videoSize + thumbnailsSize;
    }, 0);

    usedSpaceCache.set(uid, used);
  }

  return used;
};

export async function getUserType(uid: string): Promise<UserType> {
  if (userTypeCache.has(uid)) {
    return userTypeCache.get(uid) as UserType;
  } else {
    const user = await prisma.user.findFirstOrThrow({ where: { uid }, select: { type: true } });
    if (user.type) {
      userTypeCache.set(uid, user.type);
    }
    return user.type;
  }
}

export async function getLimitsForUser(userId: string) {
  const type = await getUserType(userId);
  const max = limitsConfig[type];

  const used: number = await getSpaceUsedByUser(userId);

  return {
    type,
    bytes: { used, max },
  };
}

export async function doesUserHaveSpaceLeftForFile(userId: string, file: MyFile) {
  const limits = await getLimitsForUser(userId);

  const spaceLeft = limits.bytes.max - limits.bytes.used;

  return spaceLeft - file.size > 0;
}
