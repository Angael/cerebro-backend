import fs from 'fs-extra';
import {
  DOWNLOADS_DIR,
  OPTIMIZATION_DIR,
  TEMP_DIR,
  THUMBNAILS_DIR,
  UPLOADS_DIR,
} from './utils/consts.js';

await fs.emptyDir(TEMP_DIR).catch((e) => {});
await fs.mkdir(UPLOADS_DIR, { recursive: true });
await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
await fs.mkdir(OPTIMIZATION_DIR, { recursive: true });
