import { limitsConfig } from '../../utils/limits.js';
import firebase from '../../firebase/firebase-params.js';
import { prisma } from '../../db/db.js';
import { usedSpaceCache, userTypeCache } from '../../cache/userCache.js';
import { UserType } from '@prisma/client';

export const getSpaceUsedByUser = async (uid: string): Promise<number> => {
  let used: number;
  if (usedSpaceCache.has(uid)) {
    used = usedSpaceCache.get(uid);
  } else {
    const items = await prisma.item.findMany({
      where: { userUid: uid },
      include: {
        Image: true,
        Video: true,
        thumbnails: true,
      },
    });

    used = items.reduce((sum, item) => {
      const imagesSize = item.Image.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      const videoSize = item.Video.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      const thumbnailsSize = item.thumbnails.reduce((sum, image) => {
        return sum + image.size;
      }, 0);

      return imagesSize + videoSize + thumbnailsSize;
    }, 0);

    usedSpaceCache.set(uid, used);
  }

  return used;
};

export async function getUserType(uid: string): Promise<UserType> {
  if (userTypeCache.has(uid)) {
    return userTypeCache.get(uid);
  } else {
    const { type } = await prisma.user.findFirst({ where: { uid }, select: { type: true } });
    if (type) {
      userTypeCache.set(uid, type);
    }
    return type;
  }
}

export async function getLimitsForUser(user: firebase.auth.DecodedIdToken) {
  const type = await getUserType(user.uid);
  const max = limitsConfig[type];

  const used = getSpaceUsedByUser(user.uid);

  return {
    type,
    bytes: { used, max },
  };
}
