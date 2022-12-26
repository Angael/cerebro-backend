import { IItem, SpaceOptimized } from '../../models/IItem.js';
import { db } from '../../db/db.js';
import { DB_TABLE } from '../../utils/consts.js';
import { makeItemQueries } from '../../utils/makeItemQueries.js';
import { joinItemQueries } from '../../utils/joinItemQueries.js';
import { IFrontItem } from '../../models/for-frontend/IFrontItem.js';
import firebase from 'firebase-admin';
import { forEach } from 'modern-async';
import { S3DeleteMany } from '../../aws/s3-helpers.js';

export async function getAllItems(): Promise<IFrontItem[]> {
  const items: IItem[] = await db.select().from(DB_TABLE.item);

  const { images, thumbnails, videos } = await makeItemQueries(db, items);

  return joinItemQueries(items, images, videos, thumbnails);
}

export async function getItem(id: number): Promise<IFrontItem> {
  const items: IItem[] = await db.select().from(DB_TABLE.item).where({ id });

  const { images, thumbnails, videos } = await makeItemQueries(db, items);

  const joined = joinItemQueries(items, images, videos, thumbnails);

  if (joined.length === 1) {
    return joined[0];
  } else {
    throw new Error('Found ' + joined.length + 'items');
  }
}

export async function updateItemProcessed(
  itemId: IItem['id'],
  processed: SpaceOptimized,
): Promise<any> {
  return db.transaction(async (trx) => {
    await db(DB_TABLE.item)
      .transacting(trx)
      .where({ id: itemId })
      .update({ processed } as IItem);
  });
}

export async function deleteItem(itemId: IItem['id'], userId: firebase.auth.DecodedIdToken['uid']) {
  const row = (await db.select('account_uid').from(DB_TABLE.item).where({ id: itemId }))[0];

  if (row) {
    const { account_uid } = row;

    if (account_uid === userId) {
      // We can delete the file
      const { thumbnails, images, videos } = await makeItemQueries(db, [{ id: itemId }]);

      const s3PathsToDelete: string[] = [];
      await forEach(thumbnails, async (thumbnail) => {
        s3PathsToDelete.push(thumbnail.path);
        await db(DB_TABLE.thumbnail).where({ id: thumbnail.id }).del();
      });
      await forEach(images, async (image) => {
        s3PathsToDelete.push(image.path);
        await db(DB_TABLE.image).where({ id: image.id }).del();
      });
      await forEach(videos, async (video) => {
        s3PathsToDelete.push(video.path);
        await db(DB_TABLE.video).where({ id: video.id }).del();
      });

      await db(DB_TABLE.item).where({ id: itemId }).del();

      // Better for AWS costs, but could lead to orphaned files in S3
      await S3DeleteMany(s3PathsToDelete);
    } else {
      throw new Error('unauthorized');
    }
  } else {
    throw new Error('404');
  }
}
