import { Scheduler } from 'modern-async';
import logger from '../../utils/log.js';
import { processSomeItem } from './processSomeItem.js';

const mediaProcessor = new Scheduler(
  () =>
    processSomeItem()
      .then((id) => {
        if (!id === null) {
          // some item was optimized!
          logger.verbose('Optimized itemId %i', id);
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
