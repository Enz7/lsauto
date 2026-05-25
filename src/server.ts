import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import { logger, isProd } from './config/logger.js';
import { pool } from './config/db.js';
import { initDB } from './db/migrations.js';
import { securityHeaders } from './middleware/security.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { setupSocket } from './services/socket.js';

import authRouter from './routes/auth.js';
import carsRouter from './routes/cars.js';
import requestsRouter from './routes/requests.js';
import favoritesRouter from './routes/favorites.js';
import dealsRouter from './routes/deals.js';
import postsRouter from './routes/posts.js';
import vlogsRouter from './routes/vlogs.js';
import suppliersRouter from './routes/suppliers.js';
import profileRouter from './routes/profile.js';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';
import tradeInRouter from './routes/tradeIn.js';
import customsRouter from './routes/customs.js';
import fraudRouter from './routes/fraud.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

if (!process.env.JWT_SECRET) {
  logger.fatal('JWT_SECRET не найден в .env');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  logger.fatal('DATABASE_URL не найден в .env');
  process.exit(1);
}

export const app = express();

app.use(securityHeaders);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (req.path.startsWith('/api')) {
      logger[res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'debug'](
        { method: req.method, path: req.path, status: res.statusCode, ms },
        'request'
      );
    }
  });
  next();
});

app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) app.use(express.static(distPath));
}

app.use('/api/v1', apiRateLimit);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cars', carsRouter);
app.use('/api/v1/requests', requestsRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/deals', dealsRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/vlogs', vlogsRouter);
app.use('/api/v1/suppliers', suppliersRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/trade-in', tradeInRouter);
app.use('/api/v1/customs', customsRouter);
app.use('/api/v1/fraud', fraudRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/api/health', async (_req, res) => {
  let dbOk = false;
  try { await pool.query('SELECT 1'); dbOk = true; } catch (_) {}
  res.json({ status: 'ok', db: dbOk, time: new Date().toISOString(), env: isProd ? 'production' : 'development' });
});

if (isProd) {
  app.get('*', (_req, res) => {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend не собран. Запустите npm run build.');
    }
  });
}

app.use((err: Error & { code?: string }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.constructor.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  logger.error({ err: err.message, path: req.path }, 'unhandled error');
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

if (process.env.NODE_ENV !== 'test') {
  const httpServer = setupSocket(app, ALLOWED_ORIGIN);
  initDB().then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info({ port: PORT, env: isProd ? 'production' : 'development' }, 'LSAuto server started');
      if (!isProd) logger.info('Frontend: http://127.0.0.1:5173 (npm run dev)');
    });
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutdown signal received');
    httpServer.close(async () => {
      logger.info('HTTP server closed');
      try { await pool.end(); logger.info('DB pool closed'); }
      catch (err: unknown) { logger.warn({ err: (err as Error).message }, 'DB pool close error'); }
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced shutdown after timeout'); process.exit(1); }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err: err.message, stack: err.stack }, 'uncaughtException');
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
  });
}
