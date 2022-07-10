import fs from 'fs-extra';
import promiseRetry from 'promise-retry';

// 0, 30s, 1m, 2m, 4m, 8m, 16m, 32m, 1h 4m ...
export const betterUnlink = (path) =>
  promiseRetry({ retries: 10, factor: 2, minTimeout: 30 * 1000 }, (retry) =>
    fs.unlink(path).catch(retry),
  );
