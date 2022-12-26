import './loadEnv.js';
import startRouter from './routes/MyRouter.js';
import mediaProcessor from './auto-services/media-processor/mediaProcessor.js';

// import MyRouter from './routes/MyRouter.js';
// import SynchFilesInDirs from './auto-services/SyncDirs.js';

mediaProcessor.start();
startRouter();
