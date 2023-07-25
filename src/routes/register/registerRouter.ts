import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import z from 'zod';
import { registerUser } from './register-service.js';
import { isAuth } from '../../middleware/isAuth.js';
import { MyRoute } from '../express-helpers/routeType.js';
import logger from '../../utils/log.js';

const router = express.Router({ mergeParams: true });
router.use(express.json());

const registerBody = z.object({
  email: z.string().email(),
  uid: z.string().max(36),
});

router.post('/', isAuth, async (req: Request, res) => {
  try {
    const { email, uid } = registerBody.parse(req.body);
    logger.verbose(`register ${email} ${uid}`);
    res.json(await registerUser(uid, email));
  } catch (e) {
    errorResponse(res, e);
  }
});

const registerRouter: MyRoute = { path: '/account/register', router };
export default registerRouter;
