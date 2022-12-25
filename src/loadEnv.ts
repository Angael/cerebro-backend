import * as dotenv from 'dotenv';
dotenv.config({ path: './env/.env.' + process.env.NODE_ENV });
console.log('dupa');
console.log('env', process.env.NODE_ENV);
console.log('1', process.env.FB_PROJECT_ID);
console.log('2', process.env.FB_EMAIL);
