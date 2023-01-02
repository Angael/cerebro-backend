import { forEach } from 'modern-async';
import { S3Download } from '../../../aws/s3-helpers.js';
import { IThumbnailBeforeUpload } from '../../../models/IThumbnail.js';
import { getNameFromS3Path, makeS3Path } from '../../../utils/makeS3Path.js';
import { changeExtension } from '../../../utils/changeExtension.js';
import { generateThumbnails } from './sharpHelpers.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import { prisma } from '../../../db/db.js';
import { uploadThumbnails } from '../uploadThumbnails.js';
import { Item } from '@prisma/client';

function fetchDetails(item: Item) {
  return prisma.image.findFirst({ where: { itemId: item.id } });
}

export async function processImage(item: Item) {
  const imageRow = await fetchDetails(item);
  const download = await S3Download(imageRow.path);

  try {
    const generatedThumbs = await generateThumbnails(download);

    let thumbnails: IThumbnailBeforeUpload[] = generatedThumbs.map((t) => ({
      thumbnail: {
        itemId: item.id,
        type: t.dimensions.type,
        width: t.dimensions.width,
        height: t.dimensions.height,
        path: makeS3Path(
          item.userUid,
          t.dimensions.type,
          changeExtension(getNameFromS3Path(imageRow.path), 'webp'),
        ),
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
