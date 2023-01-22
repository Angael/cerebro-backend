// export enum VideoPurpose {
//   source = 'source',
//   preview = 'preview', // shorter version for animated thumbnails
//   standard = 'standard', // Standard compressed video quality
// }

export interface IVideoData {
  durationMs: number;
  bitrateKb: number;
  width: number;
  height: number;
}

// // Todo remove in favor of prisma types
// export interface IVideoOptimized extends IVideoData, IFileData {
//   id?: number;
//   video_id: number; // TODO change to video_id
//
//   path: string;
//   size: number;
//   purpose: VideoPurpose;
// }

// Todo remove in favor of prisma types, but maybe only sensible type?
export interface IImageData {
  width: number;
  height: number;
  animated: boolean;
}
