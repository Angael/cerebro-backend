import './loadEnv.js';
import startRouter from './routes/MyRouter.js';
import mediaProcessor from './auto-services/media-processor/mediaProcessor.js';

import './prepare.js';

mediaProcessor.start();
startRouter();
