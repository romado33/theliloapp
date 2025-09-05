export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/["'`]/g, '')
    .replace(/;/g, '')
    .trim();
};
