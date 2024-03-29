import express from 'express';
import { MyRoute } from '../express-helpers/routeType.js';
import { Tag } from '@prisma/client';
import { useCache } from '../../middleware/expressCache.js';
import { getAllTags, upsertTags } from './tags.service.js';
import logger from '../../utils/log.js';
import { tagsZod } from '../../utils/zod/validators.js';

const router = express.Router({ mergeParams: true });

// Return all tags - depricate this later when walls are implemented
router.get('/', useCache(), async (req, res) => {
  try {
    const tags: Tag[] = await getAllTags();

    res.json(tags);
  } catch (e) {
    logger.error(e);
  }
});

// ensure tags are created
router.post('/', async (req, res) => {
  try {
    const tags: string[] = tagsZod.parse(req.body.tags);
    await upsertTags(tags);

    res.json(tags);
  } catch (e) {
    logger.error(e);
  }
});

const tagsRouter: MyRoute = { path: '/tags/', router };
export default tagsRouter;
