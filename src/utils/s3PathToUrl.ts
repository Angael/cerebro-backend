export const s3PathToUrl = (processEnv: any, path: string) => {
  return `https://s3.${processEnv.AWS_REGION}.amazonaws.com/${processEnv.AWS_BUCKET_NAME}/${path}`;
};
