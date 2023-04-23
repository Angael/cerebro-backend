import mime from 'mime-types';

export const getContentType = (filePath: string) => {
  return mime.lookup(filePath) || 'application/octet-stream';
};
