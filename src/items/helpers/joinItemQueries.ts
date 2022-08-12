import {
  IFile,
  IFileData,
  IImage,
  IImageData,
  IItem,
  IVideo,
  IVideoData,
  SpaceOptimized,
} from '../../models/IItem';
import { IFrontItem } from '../../models/for-frontend/IFrontItem';
import { s3PathToUrl } from '../../utils/s3PathToUrl';
import { IThumbnailRow } from '../../models/IThumbnail';

type Thumbnails = IFrontItem['thumbnails'];

// Typing whole Pick<> can be a bitch, maybe lets simplify it? Its not safe anyway due to sql returning untyped data...
export const joinItemQueries = (
  items: IItem[],
  images: IImage[],
  videos: IVideo[],
  _thumbnails: IThumbnailRow[],
  envProcess: Object,
): IFrontItem[] => {
  return items.map((item) => {
    const filteredThumbnails = _thumbnails.filter((t) => t.item_id === item.id);

    // const foundFile = files.find((f) => f.item_id === item.id);
    const foundImage = images.find((image) => image.item_id === item.id);
    const foundVideo = videos.find((vid) => vid.item_id === item.id);

    // let fileData: IFileData;
    let video: IVideoData & { url: string };
    let image: IImageData & { url: string };
    // fileData = {
    //   filename: foundFile.filename,
    //   url: s3PathToUrl(envProcess, foundFile.path),
    //   type: foundFile.type,
    // };

    if (foundImage) {
      const { width, height, hash, isAnimated, path } = foundImage;
      image = {
        width,
        height,
        hash,
        isAnimated,
        url: s3PathToUrl(envProcess, path),
      };
    }

    if (foundVideo) {
      const { width, height, duration, bitrate, path } = foundVideo;
      video = {
        width,
        height,
        duration,
        bitrate,
        url: s3PathToUrl(envProcess, path),
      };
    }

    // Omit id
    let thumbnails: Thumbnails = filteredThumbnails.map((t) => ({
      url: s3PathToUrl(envProcess, t.path),
      type: t.type,
      isAnimated: t.isAnimated,
    }));

    const notProcessed = [
      SpaceOptimized.no,
      SpaceOptimized.started,
      SpaceOptimized.failed,
    ].includes(item.processed);

    return {
      id: item.id,
      account_uid: item.account_uid,
      type: item.type,
      private: item.private,
      created_at: item.created_at,
      processed: !notProcessed,

      video,
      image,
      thumbnails,
    };
  });
};
