import express, { Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import z from 'zod';
import { registerUser } from './register-service.js';
import { isAuth } from '../../middleware/isAuth.js';
import { MyRoute } from '../express-helpers/routeType.js';

const router = express.Router({ mergeParams: true });

const registerBody = z.object({
  email: z.string().email(),
  uid: z.string().max(36),
});

router.post('/', isAuth, async (req: Request, res) => {
  try {
    const { email, uid } = registerBody.parse(req.body);
    console.log({ email, uid });
    res.json(await registerUser(uid, email));
  } catch (e) {
    errorResponse(res, e);
  }
});

const registerRouter: MyRoute = { path: '/account/register', router };
export default registerRouter;
