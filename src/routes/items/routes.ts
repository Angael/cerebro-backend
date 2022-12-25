import { listFiles } from './fileFns.js';
import { Express } from 'express';
import logger from '../../utils/log.js';
import { addAuth } from '../../middleware/addAuth.js';
import { isPremium } from '../../middleware/isPremium.js';

export default (router: Express) => {
  router.get('/items/', addAuth, isPremium, async (req, res) => {
    try {
      res.json(await listFiles());
    } catch (e) {
      logger.error('Error: %O', e);
      res.sendStatus(500);
    }
  });
};
