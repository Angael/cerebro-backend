import { Express, Request } from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { isAuth } from '../../middleware/isAuth.js';
import { getLimitsForUser } from './limits-service.js';

export default (router: Express) => {
  router.get('/account/limits', isAuth, async (req: Request, res) => {
    try {
      res.json(await getLimitsForUser(req.user));
    } catch (e) {
      errorResponse(res, e);
    }
  });
};
