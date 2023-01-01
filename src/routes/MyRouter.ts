import express, { Express } from 'express';
import cors from 'cors';
import log from '../utils/log.js';
import { addAuth } from '../middleware/addAuth.js';

import itemRouter from './items/itemRouter.js';
import registerRoutes from './register/routes.js';
import limitsRoutes from './limits/routes.js';
import { MyRoute } from './express-helpers/routeType.js';

const routes2: ((router: Express) => void)[] = [registerRoutes, limitsRoutes];
const routes3: MyRoute[] = [itemRouter];

const startRouter = () => {
  const router = express();
  const port = process.env.PORT ?? 3000;

  router.use(express.json());
  router.use(cors());
  router.use(addAuth);
  router.get('/', (req, res) => 'v1');

  // v2 way of writing things? more compact
  routes2.forEach((registerRoutes) => {
    registerRoutes(router);
  });

  // v3 with subRouters
  routes3.forEach((myRoute) => {
    router.use(myRoute.path, myRoute.router);
  });
  router.use(itemRouter.path, itemRouter.router);

  router.listen(port, () => {
    log.info(`Router started`);
    log.info(`http://localhost:${port}/`);
  });
};

export default startRouter;
