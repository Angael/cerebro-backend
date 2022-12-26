import { deleteItem, getAllItems, getItem } from './fileFns.js';
import { Express, Request } from 'express';
import { addAuth } from '../../middleware/addAuth.js';
import { isPremium } from '../../middleware/isPremium.js';
import multer from 'multer';
import { multerOptions } from './multerConfig.js';
import { MAX_UPLOAD_SIZE } from '../../utils/consts.js';
import { uploadFileForUser } from './upload/upload.service.js';
import { errorResponse } from '../../utils/errors/errorResponse.js';

const uploadMiddleware = multer(multerOptions);

export default (router: Express) => {
  router.get('/items/', addAuth, isPremium, async (req, res) => {
    try {
      res.json(await getAllItems());
    } catch (e) {
      errorResponse(res, e);
    }
  });

  router.get('/items/item/:id', addAuth, isPremium, async (req: Request, res) => {
    try {
      const id = Number(req.params.id);
      res.json(await getItem(id));
    } catch (e) {
      errorResponse(res, e);
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
        errorResponse(res, e);
      }
    },
  );

  router.delete('/items/item/:id', addAuth, isPremium, async (req: Request, res) => {
    const id = Number(req.params.id);

    try {
      if (!id || isNaN(id)) {
        throw new Error('Bad id');
      }
      await deleteItem(id, req.user.uid);

      res.status(200).send();
    } catch (e) {
      errorResponse(res, e);
    }
  });
};
