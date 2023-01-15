import express from 'express';
import cors from 'cors';
import log from '../utils/log.js';
import { addAuth } from '../middleware/addAuth.js';

import itemRouter from './items/itemRouter.js';
import registerRouter from './register/registerRouter.js';
import limitsRouter from './limits/limitsRouter.js';
import { MyRoute } from './express-helpers/routeType.js';

const routes3: MyRoute[] = [itemRouter, registerRouter, limitsRouter];

const startRouter = () => {
  const router = express();
  const port = Number(process.env.PORT ?? 3000);

  router.use(express.json());
  router.use(cors());
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
