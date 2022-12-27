import { DB_TABLE } from '../../utils/consts.js';
import { limitsConfig } from '../../utils/limits.js';
import firebase from '../../firebase/firebase-params.js';
import { db } from '../../db/db.js';

const getThingSize = async (tableName: string, uid: string) =>
  (
    await db
      .sum({ size: tableName + '.size' })
      .from(DB_TABLE.item)
      .join(tableName, 'item.id', tableName + '.item_id')
      .where({ account_uid: uid })
  )[0];

export async function getLimitsForUser(user: firebase.auth.DecodedIdToken) {
  const { type } = (
    await db.select('account.type').from(DB_TABLE.account).where({ uid: user.uid })
  )[0];

  const { size: imgSize } = await getThingSize(DB_TABLE.image, user.uid);
  const { size: videoSize } = await getThingSize(DB_TABLE.video, user.uid);
  const { size: thumbSize } = await getThingSize(DB_TABLE.thumbnail, user.uid);

  console.log({ imgSize, videoSize, thumbSize });

  return {
    type,
    bytes: {
      used: +imgSize + +videoSize + +thumbSize,
      max: limitsConfig[type],
    },
  };
}
