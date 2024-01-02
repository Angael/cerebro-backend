import express, { Request } from 'express';
import multer from 'multer';
import z from 'zod';
import { QueryItems } from '@vanih/cerebro-contracts';

import { deleteItem, getAllItems, getItem } from './itemFns.js';
import { multerOptions } from './multerConfig.js';
import { MAX_UPLOAD_SIZE } from '../../utils/consts.js';
import { uploadFileForUser } from './upload/upload.service.js';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { useCache } from '../../middleware/expressCache.js';
import { usedSpaceCache } from '../../cache/userCache.js';
import { doesUserHaveSpaceLeftForFile } from '../limits/limits-service.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import { getItemTags } from '../tags/tags.service.js';
import { arrayFromString } from '../../utils/arrayFromString.js';
import { betterUnlink } from '../../utils/betterUnlink.js';
import logger from '../../utils/log.js';
import {
  downloadFromLinkService,
  getStatsFromLink,
} from './download-from-link/downloadFromLink.service.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { isPremium } from '../../middleware/isPremium.js';

const router = express.Router({ mergeParams: true });

const limitZod = z.number().min(1).max(30);
const pageZod = z.number().min(0).max(Number.MAX_SAFE_INTEGER);

router.get('/', async (req, res) => {
  try {
    const limit = limitZod.parse(Number(req.query.limit));
    const page = pageZod.parse(Number(req.query.page));
    const tags: number[] =
      typeof req.query.tagIds === 'string' ? arrayFromString(req.query.tagIds).map(Number) : [];

    const responseJson: QueryItems = await getAllItems(
      limit,
      page,
      tags,
      req.auth?.userId || undefined,
    );

    logger.info('Listing items %o', { userId: req.auth?.userId, page, limit });
    res.json(responseJson);
  } catch (e) {
    logger.error('Failed to list items for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

router.get('/item/:id', useCache(), async (req: Request, res) => {
  try {
    const id = Number(req.params.id);
    const item = await getItem(id, req.auth?.userId || undefined);

    logger.info('Getting item %o', { userId: req.auth?.userId, id });
    res.json(item);
  } catch (e) {
    logger.error('Failed to get item for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

router.get('/item/:id/tags', useCache(60), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tags = await getItemTags(id);
    logger.info('Getting tags for item %o', { userId: req.auth?.userId, id });
    res.json(tags);
  } catch (e) {
    logger.error('Failed to get tags for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

const uploadMiddleware = multer(multerOptions);
router.post(
  '/upload/file',
  ClerkExpressRequireAuth(),
  isPremium,
  uploadMiddleware.single('file') as any, // deal with it later, maybe version mismatch. Monkey-patching request type breaks stuff
  async (req: ReqWithAuth, res) => {
    const file = req.file;

    try {
      if (!file) {
        res.sendStatus(400);
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error('File too big');
      }

      if (process.env.MOCK_UPLOADS === 'true') {
        await new Promise((resolve) => setTimeout(resolve, 200));
        betterUnlink(file.path);
        res.status(200).send();
        return;
      }

      if (!(await doesUserHaveSpaceLeftForFile(req.auth.userId, file))) {
        throw new HttpError(413);
      }

      await uploadFileForUser({ file, userId: req.auth.userId, tags: [] });

      logger.info('Uploaded file %o', { userId: req.auth?.userId, file });
      res.status(200).send();
    } catch (e) {
      logger.error('Failed to upload file for user: %s', req.auth?.userId);
      if (file) {
        betterUnlink(file?.path);
      }
      errorResponse(res, e);
    }
  },
);

const fileFromLinkZod = z.object({
  link: z.string().url(),
  format: z.string().optional(),
});

router.post(
  '/upload/file-from-link',
  ClerkExpressRequireAuth(),
  isPremium,
  async (req: ReqWithAuth, res) => {
    try {
      const { link, format } = fileFromLinkZod.parse(req.body);

      if (process.env.MOCK_UPLOADS === 'true') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res.status(200).send();
        return;
      }

      const file = await downloadFromLinkService(link, req.auth.userId, format);

      try {
        await uploadFileForUser({ file, userId: req.auth.userId, tags: [] });

        res.status(200).send();
      } catch (e) {
        logger.error(e);
        throw e;
      } finally {
        logger.info('Uploaded file from link %o', { userId: req.auth?.userId, link });
        await betterUnlink(file.path);
      }
    } catch (e) {
      logger.error('Failed to upload file from link for user: %s', req.auth?.userId);
      errorResponse(res, e);
    }
  },
);

const fileFromLinkParamsZod = z.object({
  link: z.string().url(),
});

router.get('/upload/file-from-link', isPremium, useCache(60), async (req: Request, res) => {
  try {
    const { link } = fileFromLinkParamsZod.parse(req.query);
    logger.verbose('Stats for link %s', link);

    const stats = await getStatsFromLink(link);

    res.status(200).json(stats);
  } catch (e) {
    logger.error('Failed to get stats from link for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

router.delete('/item/:id', ClerkExpressRequireAuth(), isPremium, async (req: ReqWithAuth, res) => {
  const id = Number(req.params.id);

  try {
    if (!id || isNaN(id)) {
      throw new Error('Bad id');
    }
    await deleteItem(id, req.auth.userId);

    usedSpaceCache.del(req.auth.userId);
    res.status(200).send();
  } catch (e) {
    logger.error('Failed to delete item for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

const itemRouter: MyRoute = { path: '/items/', router };
export default itemRouter;
