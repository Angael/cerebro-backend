import './loadEnv.js';
import startRouter from './routes/MyRouter.js';
import mediaProcessor from './auto-services/media-processor/mediaProcessor.js';

import './prepare.js';
import videoCompressor from './auto-services/video-compressor/videoCompressor.js';

mediaProcessor.start();
videoCompressor.start();
startRouter();
