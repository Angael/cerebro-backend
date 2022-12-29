import { IImageData, ItemType, IVideoData } from '../IItem.js';
import { ThumbnailSize } from '../IThumbnail.js';

type Thumbnail = {
  url: string;
  type: ThumbnailSize;
};

type AddUrl = {
  url: string;
};

// Keep in sync in frontend-backend !!   Make monorepo to share ts types?
export type IFrontItem = {
  id: number;
  account_uid: string;
  type: ItemType; // Tutaj zmiana do zreflektowania na froncie
  private: boolean;
  created_at: string;
  processed: boolean;

  // TODO: zrób properte data: IImageData | IVideoData | IFileData ...
  // data: (IVideoData | IImageData) & AddUrl;

  // TODO tutaj jest problem, bo te property potrzebuja urla,
  // nie ma co wysylac do frontu path.
  // fileData?: IFileData & AddUrl;

  // I teraz filedata nie powinno byc zawsze, wiec na to tez zwroc uwage
  video?: IVideoData & AddUrl;

  image?: IImageData & AddUrl;

  thumbnails: Thumbnail[];
};
