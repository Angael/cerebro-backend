import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { isAuth } from '../../middleware/isAuth.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { generateCheckout, getAccountStatus, getPremium } from './accountUpgrade.js';
import { assertUser } from '../../utils/assertUser.js';
import z from 'zod';
import { useCache } from '../../middleware/expressCache.js';

const router = express.Router({ mergeParams: true });
router.use(express.json());

router.get('/status', isAuth, useCache(15), async (req: Request, res) => {
  try {
    assertUser(req);
    res.json(await getAccountStatus(req.user.uid));
  } catch (e) {
    errorResponse(res, e);
  }
});

router.get('/premium', isAuth, async (req: Request, res) => {
  try {
    assertUser(req);
    res.json(await getPremium());
  } catch (e) {
    errorResponse(res, e);
  }
});

const productZod = z.object({ productId: z.string() });

router.post('/generate-checkout', isAuth, async (req: Request, res) => {
  try {
    assertUser(req);
    const { productId } = productZod.parse(req.body);

    const url = await generateCheckout({ uid: req.user.uid, productId });

    res.json({ url });
  } catch (e) {
    errorResponse(res, e);
  }
});

const accountUpgradeRouter: MyRoute = { path: '/account/', router };
export default accountUpgradeRouter;
