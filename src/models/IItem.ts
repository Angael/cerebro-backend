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

export interface IItem {
  id?: number;
  account_uid: string;

  category: ItemCategory;
  private: boolean;
  processed?: boolean;
  created_at?: string; // ISO
}

export interface IFileData {
  filename: string;
  path: string;
  type: FileType;
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

export interface IVideo extends IVideoData {
  id?: number;
  file_id: number;
}

export interface IImageData {
  width: number;
  height: number;
  isAnimated: boolean;
  hash: string;
}

export interface IImage extends IImageData {
  id?: number;
  file_id: number;
}
