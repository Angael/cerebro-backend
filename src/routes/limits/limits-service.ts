import { DB_TABLE } from '../../utils/consts.js';
import { limitsConfig } from '../../utils/limits.js';
import firebase from '../../firebase/firebase-params.js';
import { db } from '../../db/db.js';
import { userTypeCache } from '../../cache/userCache.js';
import { AccountType } from '../../models/IAccount.js';

const getThingSize = async (tableName: string, uid: string): Promise<number> => {
  const response = await db
    .sum({ size: tableName + '.size' })
    .from(DB_TABLE.item)
    .join(tableName, 'item.id', tableName + '.item_id')
    .where({ account_uid: uid });

  const asNumber = Number(response[0]?.size);
  if (isNaN(asNumber)) {
    return 0;
  } else {
    return asNumber;
  }
};

export async function getUserType(uid: string): Promise<AccountType> {
  if (userTypeCache.has(uid)) {
    return userTypeCache.get(uid);
  } else {
    const { type } = (await db.select('account.type').from(DB_TABLE.account).where({ uid }))[0];
    userTypeCache.set(uid, type);
    return type;
  }
}

export async function getLimitsForUser(user: firebase.auth.DecodedIdToken) {
  const type = await getUserType(user.uid);

  const sizes = await Promise.allSettled([
    getThingSize(DB_TABLE.image, user.uid),
    getThingSize(DB_TABLE.video, user.uid),
    getThingSize(DB_TABLE.thumbnail, user.uid),
  ]);

  const used = sizes.reduce<number>(
    (sum, size) => (size.status === 'fulfilled' ? sum + size.value : sum),
    0,
  );

  return {
    type,
    bytes: {
      used: used,
      max: limitsConfig[type],
    },
  };
}
