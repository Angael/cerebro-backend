import { deleteItem, getAllItems, getAllItemsCount, getItem } from './itemFns.js';
import express, { Request } from 'express';
import { isPremium } from '../../middleware/isPremium.js';
import multer from 'multer';
import { multerOptions } from './multerConfig.js';
import { MAX_UPLOAD_SIZE } from '../../utils/consts.js';
import { uploadFileForUser } from './upload/upload.service.js';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { useCache } from '../../middleware/expressCache.js';
import { usedSpaceCache } from '../../cache/userCache.js';
import z from 'zod';

const router = express.Router({ mergeParams: true });

const limitZod = z.number().min(1).max(30);
const cursorZod = z.number().min(0).max(Number.MAX_SAFE_INTEGER);

router.get('/', async (req, res) => {
  try {
    const limit = limitZod.parse(Number(req.query.limit));
    const page = cursorZod.parse(Number(req.query.page));
    res.json(await getAllItems(limit, page));
  } catch (e) {
    errorResponse(res, e);
  }
});

router.get('/count', useCache(5), async (req, res) => {
  try {
    res.json(await getAllItemsCount());
  } catch (e) {
    errorResponse(res, e);
  }
});

router.get('/item/:id', useCache(), async (req, res) => {
  try {
    const id = Number(req.params.id);
    res.json(await getItem(id));
  } catch (e) {
    errorResponse(res, e);
  }
});

const uploadMiddleware = multer(multerOptions);
router.post(
  '/upload/file',
  isPremium,
  uploadMiddleware.single('file'),
  async (req: Request, res) => {
    const file = req.file;
    if (!file) {
      res.sendStatus(400);
      return;
    }
    try {
      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error('File too big');
      }

      await uploadFileForUser(file, req.user!);

      usedSpaceCache.del(req.user!.uid);
      res.status(200).send();
    } catch (e) {
      errorResponse(res, e);
    }
  },
);

router.delete('/item/:id', isPremium, async (req: Request, res) => {
  const id = Number(req.params.id);

  try {
    if (!id || isNaN(id)) {
      throw new Error('Bad id');
    }
    await deleteItem(id, req.user!.uid);

    usedSpaceCache.del(req.user!.uid);
    res.status(200).send();
  } catch (e) {
    errorResponse(res, e);
  }
});

const itemRouter: MyRoute = { path: '/items/', router };
export default itemRouter;
