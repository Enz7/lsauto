import pino from 'pino';

export const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  ...(isProd ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});
