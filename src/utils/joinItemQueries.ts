import { IImageData, IVideoData } from '../models/IItem.js';
import { IFrontItem } from '../models/for-frontend/IFrontItem.js';
import { s3PathToUrl } from './s3PathToUrl.js';
import { Image, Item, Processed, Thumbnail, Video } from '@prisma/client';

// TODO: Can probably get rid of this fn, if I queried item and all thumbnails, videos, images etc.
export const joinItemQueries = (
  items: Item[],
  images: Image[],
  videos: Video[],
  _thumbnails: Thumbnail[],
): IFrontItem[] => {
  return items.map((item) => {
    const filteredThumbnails = _thumbnails.filter((t) => t.itemId === item.id);

    // const foundFile = files.find((f) => f.item_id === item.id);
    const foundImage = images.find((image) => image.itemId === item.id);
    const foundVideo = videos.find((vid) => vid.itemId === item.id);

    let video: IVideoData & { url: string };
    let image: IImageData & { url: string };

    if (foundImage) {
      const { width, height, animated, path } = foundImage;
      image = {
        width,
        height,
        animated,
        url: s3PathToUrl(path),
      };
    }

    if (foundVideo) {
      const { width, height, durationMs, bitrateKb, path } = foundVideo;
      video = {
        width,
        height,
        durationMs,
        bitrateKb,
        url: s3PathToUrl(path),
      };
    }

    // Omit id
    let thumbnails: IFrontItem['thumbnails'] = filteredThumbnails.map((t) => ({
      url: s3PathToUrl(t.path),
      type: t.type,
    }));

    const notProcessed = [Processed.NO, Processed.STARTED, Processed.FAIL].some(
      (v) => v === item.processed,
    );

    return {
      id: item.id,
      account_uid: item.userUid,
      type: item.type,
      private: item.private,
      created_at: item.createdAt.toISOString(),
      processed: !notProcessed,

      video,
      image,
      thumbnails,
    };
  });
};
