export enum ItemCategory {
  file = 'file',
  website = 'website',
  text = 'text',
}

export enum FileType {
  video = 'video',
  image = 'image',
  other = 'other',
}

export enum ThumbnailSize {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
}

export interface IItem {
  id?: number;
  account_uid: string;

  category: ItemCategory;
  private: boolean;
  processed?: boolean;
  created_at?: string; // ISO
}

export interface IThumbnail {
  id?: number;
  item_id: number;

  created_at: string;
  type: ThumbnailSize;
  path: string;
  size: number; // bytes
  width: number;
  height: number;
  isAnimated: boolean;
}

export interface IFile {
  id?: number;
  item_id: number;

  filename: string;
  path: string;
  type: FileType;
  size: number;
}

export interface IVideo {
  id?: number;
  file_id: number;

  duration: number;
  bitrate: number;
  width: number;
  height: number;
}

export interface IImage {
  id?: number;
  file_id: number;

  width: number;
  height: number;
  isAnimated: boolean;
  hash: string;
}
