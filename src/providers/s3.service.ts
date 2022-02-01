import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import AWS from 'aws-sdk';

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
}
