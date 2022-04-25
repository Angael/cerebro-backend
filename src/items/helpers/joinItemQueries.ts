import { IFile, IImage, IItem, IVideo } from '../../models/IItem';
import { IFrontItem } from '../../models/for-frontend/IFrontItem';
import { s3PathToUrl } from '../../utils/s3PathToUrl';
import { IThumbnailRow } from '../../models/IThumbnail';

type FileData = IFrontItem['fileData'];
type Video = IFrontItem['video'];
type Image = IFrontItem['image'];
type Thumbnails = IFrontItem['thumbnails'];

// Typing whole Pick<> can be a bitch, maybe lets simplify it? Its not safe anyway due to sql returning untyped data...
export const joinItemQueries = (
  items: IItem[],
  files: IFile[],
  images: IImage[],
  videos: IVideo[],
  _thumbnails: IThumbnailRow[],
  envProcess: Object,
): IFrontItem[] => {
  return items.map((item) => {
    const filteredThumbnails = _thumbnails.filter((t) => t.item_id === item.id);

    const foundFile = files.find((f) => f.item_id === item.id);
    const foundImage = foundFile
      ? images.find((image) => image.file_id === foundFile.id)
      : undefined;
    const foundVideo = foundFile ? videos.find((vid) => vid.file_id === foundFile.id) : undefined;

    let fileData: FileData;
    let video: Video;
    let image: Image;
    if (foundFile) {
      fileData = {
        filename: foundFile.filename,
        url: s3PathToUrl(envProcess, foundFile.path),
        type: foundFile.type,
      };

      if (foundImage) {
        const { width, height, hash, isAnimated } = foundImage;
        image = {
          width,
          height,
          hash,
          isAnimated,
        };
      }

      if (foundVideo) {
        const { width, height, duration, bitrate } = foundVideo;
        video = {
          width,
          height,
          duration,
          bitrate,
        };
      }
    }

    // Omit id
    let thumbnails: Thumbnails = filteredThumbnails.map((t) => ({
      url: s3PathToUrl(envProcess, t.path),
      type: t.type,
      isAnimated: t.isAnimated,
    }));

    return {
      id: item.id,
      account_uid: item.account_uid,
      category: item.category,
      private: item.private,
      created_at: item.created_at,
      processed: item.processed,

      fileData,
      video,
      image,
      thumbnails,
    };
  });
};
