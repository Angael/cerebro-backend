import { getAllItems, getItem } from './fileFns.js';
import { Express, Request } from 'express';
import logger from '../../utils/log.js';
import { addAuth } from '../../middleware/addAuth.js';
import { isPremium } from '../../middleware/isPremium.js';
import multer from 'multer';
import { multerOptions } from './multerConfig.js';
import { MAX_UPLOAD_SIZE } from '../../utils/consts.js';
import { uploadFileForUser } from './upload/upload.service.js';

const uploadMiddleware = multer(multerOptions);

export default (router: Express) => {
  router.get('/items/', addAuth, isPremium, async (req, res) => {
    try {
      res.json(await getAllItems());
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

  router.post(
    '/items/upload/file',
    addAuth,
    isPremium,
    uploadMiddleware.single('file'),
    async (req: Request, res) => {
      const file = req.file;
      try {
        if (file.size > MAX_UPLOAD_SIZE) {
          throw new Error('File too big');
        }

        await uploadFileForUser(file, req.user);

        res.status(200).send();
      } catch (e) {
        logger.error('Error: %O', e);
        res.sendStatus(500);
      }
    },
  );
};
