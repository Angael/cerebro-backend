import express from 'express';
import { errorResponse } from '../../utils/errors/errorResponse.js';
import { MyRoute } from '../express-helpers/routeType.js';
import logger from '../../utils/log.js';
import { userCreated } from './userCreated.js';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

const router = express.Router({ mergeParams: true });

router.post('/', async (req: ReqWithAuth, res) => {
  try {
    const { data, object, type } = req.body as WebhookEvent;
    logger.info('Webhook %o', { type, object });

    switch (type) {
      case 'user.created':
        await userCreated(data);
        break;
      default:
        throw new Error(`Unsupported webhook type: ${type}`);
    }

    res.status(200).send();
  } catch (e) {
    const { object, type } = req?.body ?? {};
    logger.error('Failed webhook %o', { type, object });
    errorResponse(res, e);
  }
});

const webhooksRouter: MyRoute = { path: '/webhooks', router };
export default webhooksRouter;
