export enum ItemType {
  file = 'file',
  image = 'image',
  video = 'video',
  website = 'website',
  text = 'text',
}

export enum VideoPurpose {
  source = 'source',
  preview = 'preview', // shorter version for animated thumbnails
  standard = 'standard', // Standard compressed video quality
}

export enum SpaceOptimized {
  no = 'no',
  started = 'started',
  failed = 'failed',
  not_applicable = 'n/a',
  yes_v1 = 'v1', // Leave possibility for more optimized formats in the future, and versioning of how item was optimized
}

// TODO make into IItemRow and IItem
export interface IItem {
  id?: number;
  account_uid: string;

  type: ItemType;
  private: boolean;
  processed: SpaceOptimized;
  created_at?: string; // ISO
}

export interface IFileData {
  filename: string;
  path: string;
  size: number;
}

export interface IFile extends IFileData {
  id?: number;
  item_id: number;
}

export interface IVideoData {
  duration: number;
  bitrate: number;
  width: number;
  height: number;
}

export interface IVideo extends IVideoData, IFileData {
  id?: number;
  item_id: number;
}

export interface IVideoOptimized extends IVideoData, IFileData {
  id?: number;
  video_id: number; // TODO change to video_id

  path: string;
  size: number;
  purpose: VideoPurpose;
}

export interface IImageData {
  width: number;
  height: number;
  isAnimated: boolean;
  hash: string;
}

export interface IImage extends IImageData, IFileData {
  id?: number;
  item_id: number;
}
