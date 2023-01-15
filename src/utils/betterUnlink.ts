import fs from 'fs-extra';
import promiseRetry from 'promise-retry';
import { forEachSeries } from 'modern-async';

const config = { retries: 20, factor: 2, minTimeout: 5 * 1000, maxTimeout: 10 * 60 * 1000 };

export const betterUnlink = (paths: string | string[]) => {
  const pathsToUnlink = [paths].flat(1);

  return forEachSeries(pathsToUnlink, (path) => {
    promiseRetry(config, (retry) =>
      fs.unlink(path).catch((e) => {
        retry();
      }),
    );
  });
};
