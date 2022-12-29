import { Knex } from 'knex';
import { IImage, IItem, IVideo } from '../models/IItem.js';
import { IThumbnailRow } from '../models/IThumbnail.js';
import { DB_TABLE } from '../utils/consts.js';

export const makeItemQueries = async (db: Knex, items: Pick<IItem, 'id'>[]) => {
  const itemsIds = items.map((item) => item.id);

  const thumbnails: IThumbnailRow[] = await db
    .select('id', 'item_id', 'type', 'path')
    .from(DB_TABLE.thumbnail)
    .whereIn('item_id', itemsIds);

  const images: IImage[] = await db.select().from(DB_TABLE.image).whereIn('item_id', itemsIds);
  const videos: IVideo[] = await db.select().from(DB_TABLE.video).whereIn('item_id', itemsIds);

  return { thumbnails, images, videos };
};
