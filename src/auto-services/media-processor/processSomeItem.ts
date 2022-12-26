import { db } from '../../db/db.js';
import { updateItemProcessed } from '../../routes/items/fileFns.js';
import { DB_TABLE } from '../../utils/consts.js';
import { IItem, ItemType, SpaceOptimized } from '../../models/IItem.js';
import { processImage } from './image/processImage.js';

async function findNotProcessedItem(): Promise<IItem | undefined> {
  const queryResult = await db
    .select()
    .from(DB_TABLE.item)
    // .join(DB_TABLE.file, 'item.id', 'file.item_id')
    .where('processed', SpaceOptimized.no as IItem['processed'])
    .limit(1);

  return queryResult[0];
}

export async function processSomeItem(): Promise<IItem['id'] | null> {
  const item = await findNotProcessedItem();
  if (!item) {
    return null;
  }

  try {
    await updateItemProcessed(item.id, SpaceOptimized.started);
    if (item.type === ItemType.image) {
      await processImage(item);
    } else if (item.type === ItemType.video) {
      // await videoSpaceOptimizer.optimize(item);
      throw new Error('Tried to optimize unsupported video filetype');
    } else {
      throw new Error('Tried to optimize unsupported unknown filetype');
    }

    await updateItemProcessed(item.id, SpaceOptimized.yes_v1);
    return item.id;
  } catch (e) {
    await updateItemProcessed(item.id, SpaceOptimized.failed);
    throw e;
  }
}
