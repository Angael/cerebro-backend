// import fs from 'fs-extra';
// import PQueue from 'p-queue';
// import logger from '../utils/log.js';
// import DirModel from '../db/models/DirModel.js';
// import { IDirectory } from '../models/models.js';
// import { getFilesInDir } from '../routes/directories/dirFns.js';
// import { Document } from 'mongoose';
// import { join } from 'path';
// import FileModel from '../db/models/FileModel.js';
// import { forEach } from 'modern-async';
// import { subMinutes } from 'date-fns';
//
// class SyncDirs {
//   dirQueue = new PQueue({
//     concurrency: 1,
//   });
//
//   newFileQueue = new PQueue({
//     concurrency: 5,
//   });
//
//   checkOldFilesQueue = new PQueue({
//     concurrency: 1,
//   });
//
//   // scheduler = new Scheduler(this.queueUpdates, this.delay, {
//   //   concurrency: this.concurrency,
//   //   maxPending: this.maxPending,
//   //   startImmediate: true,
//   // });
//
//   // scheduler: Scheduler;
//   // delay = 4000;
//   // concurrency = 1;
//   // maxPending = 1;
//
//   constructor() {
//     fs.mkdir('./temp/preview/xs/', { recursive: true });
//
//     this.newFileQueue.on('active', () => {
//       logger.debug('newFileQueue size: %s', this.newFileQueue.size);
//     });
//   }
//
//   start() {
//     logger.info(`SyncDirs started`);
//     this.queueUpdates();
//   }
//
//   async queueUpdates() {
//     const dirs: IDirectory[] = await DirModel.find({
//       lastUpdated: { $lt: subMinutes(new Date(), 60) },
//     });
//     logger.debug(
//       `update dirs %O`,
//       dirs.map((d) => d.path),
//     );
//     dirs.forEach((dir) => this.queueDirUpdate(dir.path));
//   }
//
//   async queueDirUpdate(path: string) {
//     const dir = await DirModel.findOne({ path });
//
//     if (dir) {
//       this.dirQueue.add(() => this.syncFilesInDir(dir));
//     } else {
//       logger.error('[queueDirUpdate] Dir doesnt exist:', path);
//       throw new Error('dir not found');
//     }
//   }
//
//   async syncFilesInDir(dir: IDirectory & Document) {
//     const filesInDir = await getFilesInDir(dir.path);
//
//     logger.info('sync %s, files: %s', dir.path, filesInDir.length);
//     await forEach(filesInDir, (filePath) =>
//       this.newFileQueue.add(() => this.ensureFileInDB(filePath, dir)),
//     );
//
//     dir.lastUpdated = new Date();
//     await dir.save();
//     logger.info(`Updated dir %s`, dir.path);
//   }
//
//   async ensureFileInDB(path: string, dir: IDirectory & Document) {
//     const fullpath = join(dir.path, path);
//
//     const exists = await FileModel.exists({ path, dirId: dir._id });
//     if (!exists) {
//       logger.debug('creating file %s', fullpath);
//       const stat = await fs.stat(fullpath);
//
//       await FileModel.create({
//         path,
//         dirId: dir._id,
//         size: stat.size,
//       });
//     }
//   }
// }
//
// export default new SyncDirs();
