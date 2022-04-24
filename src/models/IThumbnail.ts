export enum ThumbnailSize {
  source = 'source',
  xs = 'xs',
  md = 'md',
}

export interface IThumbnailPayload {
  item_id: number;

  type: ThumbnailSize;
  path: string;
  size: number; // bytes
  width: number;
  height: number;
  isAnimated: boolean;
}

export interface IThumbnailRow extends IThumbnailPayload {
  id: number;
  created_at: string;
}

export interface IThumbnailBeforeUpload {
  thumbnail: IThumbnailPayload;
  diskPath: string;
}

export interface IGeneratedThumbnail {
  diskPath: string;
  dimensions: IThumbnailMeasure;
  size: number;
  isAnimated: boolean;
}

export type IThumbnailMeasure = {
  type: ThumbnailSize;
  width: number;
  height: number;
};
