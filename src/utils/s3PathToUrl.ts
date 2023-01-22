export const s3PathToUrl = (s3Path: string | undefined): string => {
  return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${s3Path}`;
};
