import fs from 'fs-extra';
import { timeout } from 'modern-async';

export const betterUnlink = (path) =>
  fs.unlink(path).catch((e) => timeout(() => fs.unlink(path), 60 * 1000));
