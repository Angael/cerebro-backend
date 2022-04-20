import { Knex } from 'knex';
import { IFile, IImage, IItem, IThumbnail, IVideo } from '../../models/IItem';

export const makeItemQueries = async (db: Knex, items: IItem[]) => {
  const itemsIds = items.map((item) => item.id);

  const thumbnails: IThumbnail[] = await db
    .select('id', 'item_id', 'type', 'path', 'isAnimated')
    .from('thumbnail')
    .whereIn('item_id', itemsIds);

  const files: IFile[] = await db
    .select('id', 'item_id', 'filename', 'path', 'type', 'size')
    .from('file')
    .whereIn('item_id', itemsIds);

  const fileIds = files.map((f) => f.id);
  const images: IImage[] = await db
    .select('id', 'file_id', 'isAnimated', 'width', 'height', 'hash')
    .from('s3_image')
    .whereIn('file_id', fileIds);

  const videos: IVideo[] = await db
    .select('id', 'file_id', 'duration', 'bitrate', 'width', 'height')
    .from('s3_video')
    .whereIn('file_id', fileIds);

  return { thumbnails, files, images, videos };
};
