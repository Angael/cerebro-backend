import AWS from 'aws-sdk';
import fs from 'fs-extra';
import logger from '../utils/log.js';

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

(async function createBucket() {
  const bucket = process.env.AWS_BUCKET_NAME as string;

  const { Buckets } = await new Promise<AWS.S3.ListBucketsOutput>((res, rej) =>
    s3.listBuckets((err, data) => (err ? rej(err) : res(data))),
  );

  const isAlreadyCreated = Buckets.some((b) => b.Name === bucket);

  if (!isAlreadyCreated) {
    logger.warn(`Bucket not found! Creating one now...`, { bucket, Buckets });
    s3.createBucket(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
      },
      (err, data) => {
        if (err) {
          logger.error(`Failed to create public bucket`, { bucket });
        } else {
          logger.info(`Created public S3 bucket`, { bucket });
        }
      },
    );
  } else {
    logger.verbose(`Bucket found`, { bucket });
  }
  // make public
})();

export function simpleUploadFile({
  key,
  filePath,
}: {
  key: string;
  filePath: string;
}): Promise<void> {
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fs.createReadStream(filePath),
    ACL: 'public-read',
  };

  return new Promise((res, rej) =>
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        logger.error(`Failed to upload to s3`, filePath);
        rej(s3Err);
      } else {
        logger.verbose(`Uploaded to s3`, data.Key);
        res();
      }
    }),
  );
}

export function deleteFile(Key: string): Promise<void> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key,
  };

  return new Promise((res, rej) =>
    s3.deleteObject(params, (s3Err) => {
      if (s3Err) {
        logger.error(`Failed to delete object`, { Key });
        rej(s3Err);
      } else {
        logger.verbose(`Deleted from s3`, { Key });
        res();
      }
    }),
  );
}

export function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return Promise.resolve();
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
      Quiet: false,
    },
  };

  return new Promise((res, rej) =>
    s3.deleteObjects(params, (s3Err) => {
      if (s3Err) {
        logger.error(`Failed to delete some objects`, { keys });
        rej(s3Err);
      } else {
        logger.verbose(`Deleted from s3`, { keys });
        res();
      }
    }),
  );
}
