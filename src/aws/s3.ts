import AWS from 'aws-sdk';
import { S3CreateBucket } from './s3-helpers.js';

AWS.config.update({
  apiVersion: 'latest',
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const s3 = new AWS.S3();

S3CreateBucket(process.env.AWS_BUCKET_NAME as string);
