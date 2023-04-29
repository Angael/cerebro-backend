import express from 'express';
import { MyRoute } from '../express-helpers/routeType.js';
import z from 'zod';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { ensureIsFile, getFileListFromFolder } from './localFsFns.js';

const router = express.Router({ mergeParams: true });

const pathZod = z.string().min(1).max(200);

router.get('/folder', async (req, res) => {
  try {
    const path = pathZod.parse(req.query.path);

    res.json({ path, files: await getFileListFromFolder(path) });
  } catch (e) {
    errorResponse(res, e);
  }
});

router.get('/file', async (req, res) => {
  try {
    const path = pathZod.parse(req.query.path);

    await ensureIsFile(path);

    res.sendFile(path);
  } catch (e) {
    errorResponse(res, e);
  }
});

const localFsRouter: MyRoute = { router, path: '/local-fs' };
export default localFsRouter;
