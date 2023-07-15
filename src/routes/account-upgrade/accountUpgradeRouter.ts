import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { isAuth } from '../../middleware/isAuth.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { getPrices } from './accountUpgrade.js';
import { assertUser } from '../../utils/assertUser.js';

const router = express.Router({ mergeParams: true });

router.get('/products', isAuth, async (req: Request, res) => {
  try {
    assertUser(req);
    res.json(await getPrices());
  } catch (e) {
    errorResponse(res, e);
  }
});

const accountUpgradeRouter: MyRoute = { path: '/account-upgrade/', router };
export default accountUpgradeRouter;
