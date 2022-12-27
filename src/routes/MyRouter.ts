import express, { Express } from 'express';
import cors from 'cors';
import log from '../utils/log.js';
import { addAuth } from '../middleware/addAuth.js';

import itemRoutes from './items/routes.js';
import registerRoutes from './register/routes.js';
import limitsRoutes from './limits/routes.js';

const routes2: ((router: Express) => void)[] = [itemRoutes, registerRoutes, limitsRoutes];

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

  router.listen(port, () => {
    log.info(`Router started`);
    log.info(`http://localhost:${port}/`);
  });
};

export default startRouter;
