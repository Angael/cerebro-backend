import { Image, Item, Thumbnail, Video } from '@prisma/client';
import { BaseItem, FrontItem, ImageItem, VideoItem } from "@vanih/cerebro-contracts";
import { s3PathToUrl } from './s3PathToUrl.js';
import { HttpError } from "./errors/HttpError.js";
import logger from "./log.js";

type ParamItem = Item & { Image: Image[]; Video: Video[]; thumbnails: Thumbnail[] };

export function getFrontItem(item: ParamItem, userUid: string | null): FrontItem {
  const sourceImage  =
    item.Image.find((e) => e.mediaType === 'SOURCE')
  const sourceVideo =
    item.Video.find((e) => e.mediaType === 'SOURCE')

  if(!sourceImage?.size && !sourceVideo?.size){
    throw new HttpError(404);
  }

  const size = sourceImage?.size ?? sourceVideo?.size ?? 0;
  const thumbnail: Thumbnail | undefined = item.thumbnails.find((e) => e.type === 'MD');
  const icon: Thumbnail | undefined = item.thumbnails.find((e) => e.type === 'XS');

  const baseItem: BaseItem = {
    id: item.id,
    isMine: item.userUid === userUid,
    private: item.private,
    createdAt: item.createdAt.toISOString(),
    size,
    thumbnail: s3PathToUrl(thumbnail?.path),
    icon: s3PathToUrl(icon?.path),
  };

  if (item.type === 'IMAGE' && sourceImage) {
    return {
      ...baseItem,
      type: 'IMAGE',
      image: {
        src: s3PathToUrl(sourceImage.path),
        height: sourceImage.height,
        width: sourceImage.width,
        animated: sourceImage.animated
      },
    } satisfies ImageItem;
  } else if(item.type === 'VIDEO' && sourceVideo){
    return {
      ...baseItem,
      type: 'VIDEO',
      video: {
        src: s3PathToUrl(sourceVideo.path),
        height: sourceVideo.height,
        width: sourceVideo.width,
        durationMs: sourceVideo.durationMs,
        bitrateKb: sourceVideo.bitrateKb
      },
    } satisfies VideoItem;
  } else {
    logger.error('Error when converting item to FrontItem, itemId: %i', item.id);
    throw new HttpError(500);
  }
}
