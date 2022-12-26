import { IItem, SpaceOptimized } from '../../models/IItem.js';
import { db } from '../../db/db.js';
import { DB_TABLE } from '../../utils/consts.js';
import { makeItemQueries } from '../../utils/makeItemQueries.js';
import { joinItemQueries } from '../../utils/joinItemQueries.js';
import { IFrontItem } from '../../models/for-frontend/IFrontItem.js';

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
