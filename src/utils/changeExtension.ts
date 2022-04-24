export const changeExtension = (filename: string, extension: string): string => {
  if (filename.includes('.')) {
    return filename.substring(0, filename.lastIndexOf('.')) + '.' + extension;
  } else {
    return filename + '.' + extension;
  }
};
