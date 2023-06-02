import { processImage } from './image/processImage.js';
import { processVideo } from './video/processVideo.js';
import { Item, ItemType } from '@prisma/client';

export async function processSomeItem(item: Item): Promise<void> {
  if (item.type === ItemType.IMAGE) {
    await processImage(item);
  } else if (item.type === ItemType.VIDEO) {
    await processVideo(item);
  } else {
    throw new Error('Tried to optimize unsupported unknown filetype');
  }
}
