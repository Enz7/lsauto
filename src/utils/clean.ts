import sanitizeHtml from 'sanitize-html';

export const clean = (str: unknown): string => {
  if (typeof str !== 'string') return str as string;
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });
};
