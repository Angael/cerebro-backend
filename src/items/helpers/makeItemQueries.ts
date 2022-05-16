import { Knex } from 'knex';
import { IFile, IImage, IItem, IVideo } from '../../models/IItem';
import { IThumbnailRow } from '../../models/IThumbnail';
import { DB_TABLE } from '../../utils/consts';

export const makeItemQueries = async (db: Knex, items: Pick<IItem, 'id'>[]) => {
  const itemsIds = items.map((item) => item.id);

  const thumbnails: IThumbnailRow[] = await db
    .select('id', 'item_id', 'type', 'path', 'isAnimated')
    .from(DB_TABLE.thumbnail)
    .whereIn('item_id', itemsIds);

  const files: IFile[] = await db
    .select('id', 'item_id', 'filename', 'path', 'type', 'size')
    .from(DB_TABLE.file)
    .whereIn('item_id', itemsIds);

  const fileIds = files.map((f) => f.id);
  const images: IImage[] = await db
    .select('id', 'file_id', 'isAnimated', 'width', 'height', 'hash')
    .from(DB_TABLE.image)
    .whereIn('file_id', fileIds);

  const videos: IVideo[] = await db
    .select('id', 'file_id', 'duration', 'bitrate', 'width', 'height')
    .from(DB_TABLE.video)
    .whereIn('file_id', fileIds);

  return { thumbnails, files, images, videos };
};
