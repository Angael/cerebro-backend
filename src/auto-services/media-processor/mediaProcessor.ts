import { Scheduler } from 'modern-async';
import logger from '../../utils/log.js';
import fs from 'fs-extra';
import { DOWNLOADS_DIR, THUMBNAILS_DIR } from '../../utils/consts.js';
import { processSomeItem } from './processSomeItem.js';

fs.mkdir(DOWNLOADS_DIR, { recursive: true });
fs.mkdir(THUMBNAILS_DIR, { recursive: true });

const mediaProcessor = new Scheduler(
  () =>
    processSomeItem()
      .then((id) => {
        if (!id === null) {
          // some item was optimized!
          logger.verbose('Item optimized %i', id);
        }
      })
      .catch((error) => {
        logger.error('Item not optimized: %O', error);
      }),
  4000,
  {
    concurrency: 1,
    maxPending: 1,
    startImmediate: true,
  },
);

export default mediaProcessor;
