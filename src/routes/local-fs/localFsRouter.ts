import express from 'express';
import { MyRoute } from '../express-helpers/routeType.js';
import z from 'zod';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { ensureIsFile, getFileListFromFolder, moveFiles } from './localFsFns.js';
import { betterUnlink } from '../../utils/betterUnlink.js';

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

// validate with zod
const payloadZod = z.object({
  type: z.enum(['upload', 'move']),
  filePaths: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  moveDist: z.string().optional(),
});

router.post('/files', async (req, res) => {
  try {
    const payload = payloadZod.parse(req.body);

    switch (payload.type) {
      case 'move':
        await moveFiles(payload.filePaths, payload.moveDist ?? '');
        break;
      default:
        break;
    }
    res.sendStatus(204);
  } catch (e) {
    errorResponse(res, e);
  }
});

const deleteFilesZod = z.object({
  paths: z.string().array().min(1).max(1000),
});

router.delete('/files', async (req, res) => {
  try {
    const { paths } = deleteFilesZod.parse(req.body);

    await betterUnlink(paths);
    res.sendStatus(204);
  } catch (e) {
    errorResponse(res, e);
  }
});

const localFsRouter: MyRoute = { router, path: '/local-fs' };
export default localFsRouter;
