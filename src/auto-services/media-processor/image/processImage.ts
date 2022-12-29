import { forEach } from 'modern-async';
import { IImage, IItem } from '../../../models/IItem.js';
import { DB_TABLE } from '../../../utils/consts.js';
import { S3Download } from '../../../aws/s3-helpers.js';
import { IThumbnailBeforeUpload } from '../../../models/IThumbnail.js';
import { getNameFromS3Path, makeS3Path } from '../../../utils/makeS3Path.js';
import { changeExtension } from '../../../utils/changeExtension.js';
import { generateThumbnails } from './sharpHelpers.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import { db } from '../../../db/db.js';
import { uploadThumbnails } from '../uploadThumbnails.js';

async function fetchDetails(item: IItem): Promise<IImage> {
  return (await db.select().from(DB_TABLE.image).where({ item_id: item.id }).limit(1))[0];
}

export async function processImage(item: IItem) {
  const imageRow = await fetchDetails(item);
  const download = await S3Download(imageRow.filename, imageRow.path);

  try {
    const generatedThumbs = await generateThumbnails(download);

    let thumbnails: IThumbnailBeforeUpload[] = generatedThumbs.map((t) => ({
      thumbnail: {
        ...t.dimensions,
        item_id: item.id,
        isAnimated: t.isAnimated, // TODO: Lie? It can I think result in animated thumbnail
        path: makeS3Path(
          item.account_uid,
          t.dimensions.type,
          changeExtension(getNameFromS3Path(imageRow.path), 'webp'),
        ),
        filename: imageRow.filename,
        size: t.size,
      },
      diskPath: t.diskPath,
    }));

    try {
      await uploadThumbnails(thumbnails);
    } catch (e) {
      //
    } finally {
      forEach(thumbnails, (t) => betterUnlink(t.diskPath));
    }
  } catch (e) {
    //
  } finally {
    betterUnlink(download);
  }
}
