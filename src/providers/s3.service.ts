import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import AWS from 'aws-sdk';
import fs from 'fs-extra';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
    this.logger.verbose(`s3 connecting`);

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
    this.s3 = new AWS.S3();

    this.logger.verbose(`s3 connected`);

    this.createBucket();
  }

  async createBucket() {
    const s3 = this.s3;
    const bucket = process.env.AWS_BUCKET_NAME as string;

    const { Buckets } = await new Promise<AWS.S3.ListBucketsOutput>((res, rej) =>
      s3.listBuckets((err, data) => (err ? rej(err) : res(data))),
    );

    const isAlreadyCreated = Buckets.some((b) => b.Name === bucket);

    if (!isAlreadyCreated) {
      this.logger.warn(`Bucket not found! Creating one now...`, { bucket, Buckets });
      s3.createBucket(
        {
          Bucket: process.env.AWS_BUCKET_NAME,
          ACL: 'public-read',
        },
        (err, data) => {
          if (err) {
            this.logger.error(`Failed to create public bucket`, { bucket });
          } else {
            this.logger.info(`Created public S3 bucket`, { bucket });
          }
        },
      );
    } else {
      this.logger.verbose(`Bucket found`, { bucket });
    }
    // make public
  }

  getS3(): AWS.S3 {
    return this.s3;
  }

  simpleUploadFile({ key, filePath }: { key: string; filePath: string }): Promise<void> {
    const s3 = this.s3;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fs.createReadStream(filePath),
      ACL: 'public-read',
    };

    return new Promise((res, rej) =>
      s3.upload(params, (s3Err, data) => {
        if (s3Err) {
          this.logger.error(`Failed to upload to s3`, filePath);
          rej(s3Err);
        } else {
          this.logger.verbose(`Uploaded to s3`, data.Key);
          res();
        }
      }),
    );
  }

  deleteFile(Key: string): Promise<void> {
    const s3 = this.s3;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
    };

    return new Promise((res, rej) =>
      s3.deleteObject(params, (s3Err) => {
        if (s3Err) {
          this.logger.error(`Failed to delete object`, { Key });
          rej(s3Err);
        } else {
          this.logger.verbose(`Deleted from s3`, { Key });
          res();
        }
      }),
    );
  }

  deleteFiles(keys: string[]): Promise<void> {
    const s3 = this.s3;

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
          this.logger.error(`Failed to delete some objects`, { keys });
          rej(s3Err);
        } else {
          this.logger.verbose(`Deleted from s3`, { keys });
          res();
        }
      }),
    );
  }
}
