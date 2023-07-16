import express from 'express';
import cors from 'cors';
import log from '../utils/log.js';
import { addAuth } from '../middleware/addAuth.js';

import itemRouter from './items/itemRouter.js';
import registerRouter from './register/registerRouter.js';
import limitsRouter from './limits/limitsRouter.js';
import tagsRouter from './tags/tagsRouter.js';
import { MyRoute } from './express-helpers/routeType.js';
import localFsRouter from './local-fs/localFsRouter.js';
import { isProd } from '../utils/env.js';
import accountUpgradeRouter from './account-upgrade/accountUpgradeRouter.js';
import stripeWebhookRouter from './stripe-webhooks/stripeWebhookRouter.js';

const routes3: MyRoute[] = [
  itemRouter,
  registerRouter,
  limitsRouter,
  tagsRouter,
  !isProd && localFsRouter,
  accountUpgradeRouter,
  stripeWebhookRouter,
].filter((router): router is MyRoute => !!router);

const startRouter = () => {
  const router = express();
  const port = Number(process.env.PORT ?? 3000);

  router.use(
    cors({
      origin: process.env.CORS_URL,
      credentials: true,
      maxAge: 600,
    }),
  );
  router.use(addAuth);
  router.get('/', (req, res) => 'v1');

  routes3.forEach((myRoute) => {
    router.use(myRoute.path, myRoute.router);
  });

  router.listen(port, () => {
    log.info(`Router started`);
    log.info(`http://localhost:${port}/`);
  });
};

export default startRouter;
