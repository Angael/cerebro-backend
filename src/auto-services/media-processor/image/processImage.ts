import { forEach } from 'modern-async';
import { S3Download, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { IThumbnailBeforeUpload } from '../../../models/IThumbnail.js';
import { getNameFromS3Path, makeS3Path } from '../../../utils/makeS3Path.js';
import { changeExtension } from '../../../utils/changeExtension.js';
import { generateOptimizedSrc, generateThumbnails } from './sharpHelpers.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import { prisma } from '../../../db/db.js';
import { uploadThumbnails } from '../uploadThumbnails.js';
import { Item } from '@prisma/client';
import logger from '../../../utils/log.js';

function fetchDetails(item: Item) {
  return prisma.image.findFirstOrThrow({ where: { itemId: item.id, mediaType: 'SOURCE' } });
}

export async function processImage(item: Item) {
  let error = false;

  const imageRow = await fetchDetails(item);
  const download = await S3Download(imageRow.path);

  const sourceFileName = getNameFromS3Path(imageRow.path);

  // Optimized src
  try {
    await prisma.item.update({
      where: { id: item.id },
      data: { optimized: 'STARTED' },
    });

    const { diskPath, width, height, size, animated } = await generateOptimizedSrc(download);

    const s3Path = makeS3Path(item.userUid, 'optimized', changeExtension(sourceFileName, 'webp'));

    await prisma.image.create({
      data: {
        mediaType: 'COMPRESSED',
        path: s3Path,
        size,
        animated,
        height,
        width,
        itemId: item.id,
      },
    });

    await S3SimpleUpload({
      key: s3Path,
      filePath: diskPath,
    });

    await prisma.item.update({
      where: { id: item.id },
      data: { optimized: 'V1' },
    });

    betterUnlink(diskPath);
  } catch (e) {
    logger.error('Failed to generate optimized src for item.id %i', item.id);
    error = true;
    await prisma.item.update({
      where: { id: item.id },
      data: { optimized: 'FAIL' },
    });
  }

  // TODO if src fails, thumbnails are not generated, is this a problem?

  // Thumbnails
  try {
    const generatedThumbs = await generateThumbnails(download);

    let thumbnails: IThumbnailBeforeUpload[] = generatedThumbs.map((t) => ({
      thumbnail: {
        itemId: item.id,
        type: t.dimensions.type,
        width: t.dimensions.width,
        height: t.dimensions.height,
        path: makeS3Path(item.userUid, t.dimensions.type, changeExtension(sourceFileName, 'webp')),
        size: t.size,
      },
      diskPath: t.diskPath,
    }));

    try {
      await uploadThumbnails(thumbnails);
    } catch (e) {
      logger.error('Failed to upload thumbnails for item.id %i', item.id);
      error = true;
    } finally {
      forEach(thumbnails, (t) => betterUnlink(t.diskPath));
    }
  } catch (e) {
    logger.error('Failed to generate thumbnails for item.id %i', item.id);
    error = true;
  }

  betterUnlink(download);

  if (error) {
    throw new Error('Failed to process image');
  }
}
