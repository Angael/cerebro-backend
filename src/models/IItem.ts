// export enum ItemType {
//   file = 'file',
//   image = 'image',
//   video = 'video',
//   website = 'website',
//   text = 'text',
// }

export enum VideoPurpose {
  source = 'source',
  preview = 'preview', // shorter version for animated thumbnails
  standard = 'standard', // Standard compressed video quality
}

// Todo remove in favor of prisma types
export enum SpaceOptimized {
  no = 'no',
  started = 'started',
  failed = 'failed',
  not_applicable = 'n/a',
  yes_v1 = 'v1', // Leave possibility for more optimized formats in the future, and versioning of how item was optimized
}

// // TODO make into IItemRow and IItem
// export interface IItem {
//   id?: number;
//   account_uid: string;
//
//   type: ItemType;
//   private: boolean;
//   processed: SpaceOptimized;
//   created_at?: string; // ISO
// }

// Todo remove in favor of prisma types
export interface IFileData {
  filename: string;
  path: string;
  size: number;
}

// Todo remove in favor of prisma types
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

// Todo remove in favor of prisma types
export interface IVideo extends IVideoData, IFileData {
  id?: number;
  item_id: number;
}

// Todo remove in favor of prisma types
export interface IVideoOptimized extends IVideoData, IFileData {
  id?: number;
  video_id: number; // TODO change to video_id

  path: string;
  size: number;
  purpose: VideoPurpose;
}

// Todo remove in favor of prisma types, but maybe only sensible type?
export interface IImageData {
  width: number;
  height: number;
  animated: boolean;
}

// Todo remove in favor of prisma types
export interface IImage extends IImageData, IFileData {
  id?: number;
  item_id: number;
}
