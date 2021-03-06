export const MB = 1024 * 1024;
export const GB = 1024 * 1024 * 1024;

export const MD_CELL_SIZE = 300;
export const XS_CELL_SIZE = 32;

export const MAX_UPLOAD_SIZE = 30 * MB;
export const UPLOADS_DIR = '_temp/file-uploads';
export const DOWNLOADS_DIR = '_temp/downloads';
export const THUMBNAILS_DIR = '_temp/thumbnails';

export enum DB_TABLE {
  thumbnail = 'thumbnail',
  video = 's3_video',
  video_optimized = 's3_video_optimized', // 360p 720p 1080p etc. webm
  image = 's3_image',
  file = 'file',
  item = 'item',

  account = 'account',

  seen_time = 'seen_time',
  wall = 'wall',
  wall_item = 'wall_item',
}
