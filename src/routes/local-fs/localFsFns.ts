import fs from 'fs-extra';
import fg from 'fast-glob';
import { HttpError } from '../../utils/errors/HttpError.js';
import path from 'path';
import { forEach } from 'modern-async';

type LocalFile = {
  path: string;
  type: 'image' | 'video' | 'unknown';
};

const imageExtensions = ['png', 'gif', 'webp', 'jpeg', 'jpg'];
const videoExtensions = ['mp4', 'webm', 'mkv'];

const getFileType = (path: string) => {
  const extension = path.split('.').pop();

  if (imageExtensions.includes(extension as any)) {
    return 'image';
  } else if (videoExtensions.includes(extension as any)) {
    return 'video';
  } else {
    return 'unknown';
  }
};

export async function getFileListFromFolder(path: string): Promise<LocalFile[]> {
  // Check if path is a folder
  const isFolder = fs.lstatSync(path).isDirectory();
  // If it is, return the list of files
  if (isFolder) {
    const fileList: string[] = await fg('*', {
      onlyFiles: true,
      deep: 1,
      cwd: path,
      absolute: true,
    });

    return fileList.map((path) => ({
      path,
      type: getFileType(path),
    }));
  } else {
    throw new HttpError(400);
  }
  // If it isn't, return an error
}

export async function ensureIsFile(path: string): Promise<boolean> {
  try {
    return fs.lstat(path).then((stat) => stat.isFile());
  } catch (e) {
    throw new HttpError(400);
  }
}

export async function moveFiles(files: string[], dist: string): Promise<void> {
  if (!dist) throw new HttpError(400);
  const isFolder = (await fs.lstat(dist)).isDirectory();
  if (!isFolder) throw new HttpError(400);

  return forEach(files, async (file: string) => {
    const filename = path.basename(file);
    try {
      await fs.move(file, path.join(dist, filename), { overwrite: false });

      console.log('moved file ' + file);
    } catch (e) {
      console.log('failed to move file ' + file);
    }
  }).catch(() => undefined);
}
