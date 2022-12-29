import { Express, Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import z from 'zod';
import { registerUser } from './register-service.js';
import { isAuth } from '../../middleware/isAuth.js';

const registerBody = z.object({
  email: z.string().email(),
  uid: z.string().max(36),
});

export default (router: Express) => {
  router.post('/account/register', isAuth, async (req: Request, res) => {
    try {
      const { email, uid } = registerBody.parse(req.body);
      console.log({ email, uid });
      res.json(await registerUser(uid, email));
    } catch (e) {
      errorResponse(res, e);
    }
  });
};
