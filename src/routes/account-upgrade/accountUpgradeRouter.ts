import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { isAuth } from '../../middleware/isAuth.js';
import { MyRoute } from '../express-helpers/routeType.js';
import { generateCheckout, getProducts } from './accountUpgrade.js';
import { assertUser } from '../../utils/assertUser.js';
import z from 'zod';

const router = express.Router({ mergeParams: true });
router.use(express.json());

router.get('/products', isAuth, async (req: Request, res) => {
  try {
    assertUser(req);
    res.json(await getProducts());
  } catch (e) {
    errorResponse(res, e);
  }
});

const productZod = z.object({ productId: z.string() });

router.post('/generate-checkout', isAuth, async (req: Request, res) => {
  try {
    assertUser(req);
    const { productId } = productZod.parse(req.body);
    // const products = await getProducts();

    const url = await generateCheckout({ uid: req.user.uid, productId });

    res.json({ url });
  } catch (e) {
    errorResponse(res, e);
  }
});

const accountUpgradeRouter: MyRoute = { path: '/account-upgrade/', router };
export default accountUpgradeRouter;
