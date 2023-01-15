import './loadEnv.js';
import startRouter from './routes/MyRouter.js';
import mediaProcessor from './auto-services/media-processor/mediaProcessor.js';

import './prepare.js';

// process.on('uncaughtException', () => {
//   console.log('uncaught err1111');
// });

mediaProcessor.start();
startRouter();
