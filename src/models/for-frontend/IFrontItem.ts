import { FileType, IFile, IImage, IItem, ItemCategory, IVideo } from '../IItem';
import { ThumbnailSize } from '../IThumbnail';

type Thumbnail = {
  url: string;
  type: ThumbnailSize;
  isAnimated: boolean;
};

// Keep in sync in frontend-backend !!   Make monorepo to share ts types?
export type IFrontItem = {
  id: number;
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
