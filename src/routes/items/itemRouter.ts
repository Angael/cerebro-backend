import {
  addTagsToItems,
  areItemsOwnedByUser,
  deleteItem,
  getAllItems,
  getAllItemsCount,
  getItem,
} from './itemFns.js';
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
import { doesUserHaveSpaceLeftForFile } from '../limits/limits-service.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import { getItemTags, upsertTags } from '../tags/tags.service.js';
import { arrayFromString } from '../../utils/arrayFromString.js';
import { QueryItems } from '@vanih/cerebro-contracts';
import { betterUnlink } from '../../utils/betterUnlink.js';
import { tagsZod } from '../../utils/zod/validators.js';

const router = express.Router({ mergeParams: true });

const limitZod = z.number().min(1).max(30);
const pageZod = z.number().min(0).max(Number.MAX_SAFE_INTEGER);

router.get('/', async (req: Request, res) => {
  try {
    const limit = limitZod.parse(Number(req.query.limit));
    const page = pageZod.parse(Number(req.query.page));
    const tags: number[] =
      typeof req.query.tagIds === 'string' ? arrayFromString(req.query.tagIds).map(Number) : [];

    const responseJson: QueryItems = await getAllItems(limit, page, tags, req.user?.uid);

    res.json(responseJson);
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

router.get('/item/:id', useCache(), async (req: Request, res) => {
  try {
    const id = Number(req.params.id);
    res.json(await getItem(id, req.user?.uid));
  } catch (e) {
    errorResponse(res, e);
  }
});

router.get('/item/:id/tags', useCache(600), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tags = await getItemTags(id);
    res.json(tags);
  } catch (e) {
    errorResponse(res, e);
  }
});

// in GET, param can be string or array
const tagsGETZod = z.union([z.string(), z.array(z.string())]);

const uploadMiddleware = multer(multerOptions);
router.post(
  '/upload/file',
  isPremium,
  uploadMiddleware.single('file'),
  async (req: Request, res) => {
    const file = req.file;
    try {
      const tagNames: string[] = [tagsGETZod.parse(req.body.tags)].flat();

      if (!file) {
        res.sendStatus(400);
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error('File too big');
      }

      if (process.env.MOCK_UPLOADS === 'true') {
        betterUnlink(file.path);
        res.status(200).send();
        return;
      }

      const hasEnoughSpace = await doesUserHaveSpaceLeftForFile(req.user!, file);
      if (!hasEnoughSpace) {
        throw new HttpError(413);
      }

      const tags = await upsertTags(tagNames);
      await uploadFileForUser({ file, user: req.user!, tags });

      res.status(200).send();
    } catch (e) {
      if (file) {
        betterUnlink(file?.path);
      }
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

const addTagsZod = z.object({
  itemIds: z.array(z.number()),
  tags: tagsZod,
});

router.post('/item/many/tags', isPremium, async (req: Request, res) => {
  try {
    const { itemIds, tags } = addTagsZod.parse(req.body);
    if (!(await areItemsOwnedByUser(itemIds, req.user!.uid))) {
      throw new HttpError(403);
    }

    const insertedTags = await upsertTags(tags);
    await addTagsToItems(itemIds, insertedTags);

    usedSpaceCache.del(req.user!.uid);
    res.status(200).send();
  } catch (e) {
    errorResponse(res, e);
  }
});

const itemRouter: MyRoute = { path: '/items/', router };
export default itemRouter;
