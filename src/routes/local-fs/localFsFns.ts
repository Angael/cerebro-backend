import fs from 'fs-extra';
import { HttpError } from '../../utils/errors/HttpError.js';

export function getFileListFromFolder(path: string): Promise<string[]> {
  // Check if path is a folder
  const isFolder = fs.lstatSync(path).isDirectory();
  // If it is, return the list of files
  if (isFolder) {
    return fs.readdir(path);
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
