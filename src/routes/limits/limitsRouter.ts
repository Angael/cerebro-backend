import express from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { getLimitsForUser } from './limits-service.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import logger from '../../utils/log.js';

const router = express.Router({ mergeParams: true });

router.get('/', ClerkExpressRequireAuth(), async (req: ReqWithAuth, res) => {
  try {
    res.json(await getLimitsForUser(req.auth.userId));
  } catch (e) {
    logger.error('Failed to list limits for user: %s', req.auth?.userId);
    errorResponse(res, e);
  }
});

const limitsRouter: MyRoute = { path: '/account/limits', router };
export default limitsRouter;
