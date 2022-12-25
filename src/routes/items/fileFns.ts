import { IItem } from '../../models/IItem.js';
import { db } from '../../db/db.js';
import { DB_TABLE } from '../../utils/consts.js';
import { makeItemQueries } from '../../utils/makeItemQueries.js';
import { joinItemQueries } from '../../utils/joinItemQueries.js';
import { IFrontItem } from '../../models/for-frontend/IFrontItem.js';

export async function listFiles(): Promise<IFrontItem[]> {
  const items: IItem[] = await db.select().from(DB_TABLE.item);

  const { images, thumbnails, videos } = await makeItemQueries(db, items);

  return joinItemQueries(items, images, videos, thumbnails, process.env);
}
