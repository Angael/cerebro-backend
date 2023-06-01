import { Scheduler } from 'modern-async';
import { findUncompressedVideoItem } from './findUncompressedVideoItem.js';
import { prisma } from '../../db/db.js';
import { S3Download, S3SimpleUpload } from '../../aws/s3-helpers.js';
import { decideSettings } from './decideSettings.js';
import path from 'path';
import { OPTIMIZATION_DIR } from '../../utils/consts.js';
import { analyzeVideo, compressVideo, VideoStats } from '@vanih/dunes-node';
import { makeS3Path } from '../../utils/makeS3Path.js';
import { Item } from '@prisma/client';
import { betterUnlink } from '../../utils/betterUnlink.js';
import { changeExtension } from '../../utils/changeExtension.js';

const insertIntoDb = (itemId: Item['id'], outputStats: VideoStats, s3path: string): Promise<any> =>
  prisma.video.create({
    data: {
      itemId,
      path: s3path,
      size: outputStats.sizeBytes,
      bitrateKb: outputStats.bitrateKb,
      width: outputStats.width,
      height: outputStats.height,
      mediaType: 'COMPRESSED',
      durationMs: outputStats.durationMs,
    },
  });

const updateStatus = (itemId: number, status: Item['optimized']) =>
  prisma.item.update({
    where: { id: itemId },
    data: { optimized: status },
  });

const videoCompressor = new Scheduler(
  async () => {
    const [item, video] = await findUncompressedVideoItem();
    if (!item || !video) {
      return;
    }

    await updateStatus(item.id, 'STARTED');

    const srcVidPath = await S3Download(video.path);

    const requireCompression = !['.webm', '.mp4'].includes(path.extname(video.path));
    const filename = changeExtension(path.parse(video.path).name, 'webm');
    const outVidPath = path.join(OPTIMIZATION_DIR, filename);
    const s3KeyPath = makeS3Path(item.userUid, 'optimized', filename);
    const decided = decideSettings(video);

    const pointToSrcVideo = async () => {
      await updateStatus(item.id, 'V1');
      await insertIntoDb(item.id, { ...video, sizeBytes: video.size }, video.path);
    };

    try {
      if (decided.shouldCompress || requireCompression) {
        await compressVideo(srcVidPath, outVidPath, decided);
        const outputStats = await analyzeVideo(outVidPath);
        if (video.size > outputStats.sizeBytes || requireCompression) {
          await insertIntoDb(item.id, outputStats, s3KeyPath);
          await S3SimpleUpload({ key: s3KeyPath, filePath: outVidPath });
          await updateStatus(item.id, 'V1');
        } else {
          await pointToSrcVideo();
        }
      } else {
        await pointToSrcVideo();
      }
    } catch (e) {
      await updateStatus(item.id, 'FAIL');
    }
    await betterUnlink([srcVidPath, outVidPath]);
  },
  1000,
  {
    concurrency: 1,
    maxPending: 1,
    startImmediate: true,
  },
);

export default videoCompressor;
