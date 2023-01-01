import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { isAuth } from '../../middleware/isAuth.js';
import { getLimitsForUser } from './limits-service.js';
import { MyRoute } from '../express-helpers/routeType.js';

const router = express.Router({ mergeParams: true });

router.get('/', isAuth, async (req: Request, res) => {
  try {
    res.json(await getLimitsForUser(req.user));
  } catch (e) {
    errorResponse(res, e);
  }
});

const limitsRouter: MyRoute = { path: '/account/limits', router };
export default limitsRouter;
