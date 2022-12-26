import { listFiles, getItem } from './fileFns.js';
import { Express, Request } from 'express';
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

  router.get('/items/item/:id', addAuth, isPremium, async (req: Request, res) => {
    try {
      const id = Number(req.params.id);
      res.json(await getItem(id));
    } catch (e) {
      logger.error('Error: %O', e);
      res.sendStatus(500);
    }
  });
};
