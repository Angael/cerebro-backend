import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './.env' });
} else {
  dotenv.config({ path: './.env.' + process.env.NODE_ENV });
}
