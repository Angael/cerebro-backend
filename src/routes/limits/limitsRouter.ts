import express from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { getLimitsForUser } from './limits-service.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router({ mergeParams: true });

router.get('/', ClerkExpressRequireAuth(), async (req: ReqWithAuth, res) => {
  try {
    res.json(await getLimitsForUser(req.auth.userId));
  } catch (e) {
    errorResponse(res, e);
  }
});

const limitsRouter: MyRoute = { path: '/account/limits', router };
export default limitsRouter;
