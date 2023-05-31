import fs from 'fs-extra';
import promiseRetry from 'promise-retry';
import { forEachSeries } from 'modern-async';

const config = { retries: 20, factor: 2, minTimeout: 5 * 1000, maxTimeout: 10 * 60 * 1000 };

export const betterUnlink = (paths: string | string[]) => {
  const pathsToUnlink = [paths].flat(1);

  return forEachSeries(pathsToUnlink, (path) => {
    promiseRetry(config, async (retry) => {
      // if file doesn't exist, don't retry
      if (!(await fs.pathExists(path))) return Promise.resolve();

      return fs.unlink(path).catch((e) => {
        retry();
      });
    });
  });
};
