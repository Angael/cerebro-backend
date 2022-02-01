export enum ItemCategory {
  file = 'file',
  website = 'website',
  text = 'text',
}

export enum FileType {
  s3_video = 's3_video',
  s3_image = 's3_image',
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

export interface IFile {
  id?: number;
  item_id: number;

  filename: string;
  path: string;
  type: FileType;
  size: number;
}

export interface IS3_video {
  id?: number;
  file_id: number;

  duration: number;
  bitrate: number;
  width: number;
  height: number;
}

export interface IS3_image {
  id?: number;
  file_id: number;

  width: number;
  height: number;

  isAnimated: boolean;
  hash: string;
}
