import { FileType, IFile, IImage, IItem, ItemCategory, IVideo, ThumbnailSize } from '../IItem';

type Thumbnail = {
  url: string;
  type: ThumbnailSize;
  isAnimated: boolean;
};

export type IFrontItem = {
  id: string;
  account_uid: string;
  category: ItemCategory;
  private: boolean;
  created_at: string;

  fileData?: {
    filename: string;
    url: string;
    type: FileType;
  };

  video?: {
    width: number;
    height: number;
    duration: number;
    bitrate: number;
  };

  image?: {
    width: number;
    height: number;
    isAnimated: boolean;
    hash: string;
  };

  thumbnails: Thumbnail[];
};
