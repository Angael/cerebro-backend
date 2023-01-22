import { Thumbnail, ThumbnailType } from '@prisma/client';

export interface IThumbnailBeforeUpload {
  thumbnail: Omit<Thumbnail, 'id' | 'createdAt' | 'updatedAt'>;
  diskPath: string;
}

export interface IGeneratedThumbnail {
  diskPath: string;
  dimensions: IThumbnailMeasure;
  size: number;
  animated: boolean;
}

export type IThumbnailMeasure = {
  type: ThumbnailType;
  width: number;
  height: number;
};
