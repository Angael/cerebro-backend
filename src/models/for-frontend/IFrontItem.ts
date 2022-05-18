import { IFile, IImage, IVideo, IItem } from '../IItem';
import { ThumbnailSize } from '../IThumbnail';

type Thumbnail = {
  url: string;
  type: ThumbnailSize;
};

// TODO: Get rid of it, because I should be sending IFile IVideo and IImage.
// Keep in sync in frontend-backend !!   Make monorepo to share ts types?
export type IFrontItem = IItem &
  (IVideo | IImage | IFile) & {
    id: number;
    account_uid: string;
    private: boolean;
    created_at: string;
    updated_at: string;
    processed: boolean;

    category: 'file' | 'video' | 'image'; // necessary?
    file?: {
      url: string;
      filesize: number;
      originalFilename: string;
    };

    video?: {
      url: string;
      filesize: number;
      originalFilename: string;

      width: number;
      height: number;
      duration: number;
      bitrate: number;
    };

    image?: {
      url: string;
      filesize: number;
      originalFilename: string;

      width: number;
      height: number;
      isAnimated: boolean;
      hash: string;
    };

    thumbnails: Thumbnail[];
  };
