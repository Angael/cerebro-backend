import * as dotenv from 'dotenv';
dotenv.config({ path: './env/.env.' + process.env.NODE_ENV });
dotenv.config({ path: './.env', override: true });
