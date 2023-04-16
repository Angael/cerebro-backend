export const arrayFromString = (str: string): string[] => {
  return str.split(',').map((str) => str.trim());
};
