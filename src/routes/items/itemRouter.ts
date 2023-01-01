import { deleteItem, getAllItems, getItem } from './fileFns.js';
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

const router = express.Router({ mergeParams: true });

router.get('/', useCache(), async (req, res) => {
  try {
    res.json(await getAllItems());
  } catch (e) {
    console.log(e);
    errorResponse(res, e);
  }
});

router.get('/item/:id', useCache(), async (req: Request, res) => {
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
    try {
      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error('File too big');
      }

      await uploadFileForUser(file, req.user);

      usedSpaceCache.del(req.user.uid);
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
    await deleteItem(id, req.user.uid);

    usedSpaceCache.del(req.user.uid);
    res.status(200).send();
  } catch (e) {
    errorResponse(res, e);
  }
});

const itemRouter: MyRoute = { path: '/items/', router };
export default itemRouter;
