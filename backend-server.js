
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import sanitizeHtml from 'sanitize-html';
import nodemailer from 'nodemailer';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// ─── LOGGER ────────────────────────────────────────────────────────────────

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  ...(isProd ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});

// ─── CONFIG ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const COOKIE_NAME = 'lsauto_jwt';

if (!SECRET_KEY) {
  logger.fatal('JWT_SECRET не найден в .env');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  logger.fatal('DATABASE_URL не найден в .env');
  process.exit(1);
}

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── EMAIL ─────────────────────────────────────────────────────────────────

let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const sendEmail = async (to, subject, html) => {
  if (!mailer) return;
  try {
    await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
    logger.debug({ to, subject }, 'email sent');
  } catch (err) {
    logger.warn({ err: err.message, to }, 'email failed');
  }
};

// ─── SANITIZE ──────────────────────────────────────────────────────────────

const clean = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });
};

// ─── DB INIT & MIGRATIONS ──────────────────────────────────────────────────

const initDB = async () => {
  try {
    // Migrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const applied = await pool.query('SELECT name FROM migrations');
    const done = new Set(applied.rows.map(r => r.name));

    const migrations = [
      {
        name: '001_initial',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'Клиент',
            level INT NOT NULL DEFAULT 1,
            is_verified BOOLEAN DEFAULT false,
            fraud_score INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS cars (
            id SERIAL PRIMARY KEY,
            brand VARCHAR(100),
            model VARCHAR(100),
            year INT,
            price DECIMAL(15,2),
            origin VARCHAR(100),
            transmission VARCHAR(100),
            fuel VARCHAR(100),
            mileage INT DEFAULT 0,
            city VARCHAR(255),
            description TEXT,
            images JSONB DEFAULT '[]',
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            budget DECIMAL(15,2) DEFAULT 0,
            year_range VARCHAR(50),
            city VARCHAR(255),
            comment TEXT,
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            car_id VARCHAR(255) NOT NULL,
            UNIQUE(user_id, car_id)
          );

          CREATE TABLE IF NOT EXISTS deals (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            car_name VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'выкуплено',
            escrow_status VARCHAR(50) DEFAULT 'none',
            escrow_amount DECIMAL(15,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            supplier_id INT REFERENCES users(id) ON DELETE SET NULL,
            supplier_name VARCHAR(255),
            type VARCHAR(50) DEFAULT 'new',
            title VARCHAR(500) NOT NULL,
            text TEXT NOT NULL,
            image TEXT,
            likes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS vlogs (
            id SERIAL PRIMARY KEY,
            supplier_id INT REFERENCES users(id) ON DELETE CASCADE,
            supplier_name VARCHAR(255),
            title VARCHAR(500) NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            thumbnail TEXT,
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            room_id VARCHAR(255) NOT NULL,
            sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            sender_name VARCHAR(255),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS kyc_documents (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            doc_type VARCHAR(50) DEFAULT 'passport',
            file_url TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS fraud_events (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            ip VARCHAR(100),
            fingerprint TEXT,
            event_type VARCHAR(100),
            score INT DEFAULT 0,
            details JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `,
      },
      {
        name: '002_indexes',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
          CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
          CREATE INDEX IF NOT EXISTS idx_cars_city ON cars(city);
          CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
          CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
          CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
          CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
          CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
          CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
          CREATE INDEX IF NOT EXISTS idx_posts_supplier_id ON posts(supplier_id);
          CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at);
          CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON fraud_events(user_id);
          CREATE INDEX IF NOT EXISTS idx_fraud_events_ip ON fraud_events(ip);
          CREATE INDEX IF NOT EXISTS idx_vlogs_supplier_id ON vlogs(supplier_id);
          CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);
        `,
      },
      {
        name: '003_supplier_level_trigger',
        sql: `
          CREATE OR REPLACE FUNCTION update_supplier_level()
          RETURNS TRIGGER AS $$
          DECLARE
            deal_count INT;
            new_level INT;
          BEGIN
            SELECT COUNT(*) INTO deal_count FROM deals WHERE user_id = NEW.user_id;
            new_level := LEAST(8, GREATEST(1,
              CASE
                WHEN deal_count >= 100 THEN 8
                WHEN deal_count >= 50  THEN 7
                WHEN deal_count >= 25  THEN 6
                WHEN deal_count >= 15  THEN 5
                WHEN deal_count >= 8   THEN 4
                WHEN deal_count >= 4   THEN 3
                WHEN deal_count >= 1   THEN 2
                ELSE 1
              END
            ));
            UPDATE users SET level = new_level WHERE id = NEW.user_id;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trg_supplier_level ON deals;
          CREATE TRIGGER trg_supplier_level
            AFTER INSERT ON deals
            FOR EACH ROW EXECUTE FUNCTION update_supplier_level();
        `,
      },
      {
        name: '004_supplier_profile_and_tables',
        sql: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS experience VARCHAR(50) DEFAULT '0 лет';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 5.0;

          CREATE TABLE IF NOT EXISTS trade_in_requests (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            year INT,
            mileage INT DEFAULT 0,
            condition VARCHAR(50) DEFAULT 'Хорошее',
            owners INT DEFAULT 1,
            estimate_min DECIMAL(15,2),
            estimate_max DECIMAL(15,2),
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS news (
            id SERIAL PRIMARY KEY,
            category VARCHAR(50) DEFAULT 'market',
            title VARCHAR(500) NOT NULL,
            excerpt TEXT,
            content TEXT,
            image_url TEXT,
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `,
      },
      {
        name: '005_admin_role_and_rejection',
        sql: `
          ALTER TABLE cars ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
        `,
      },
    ];

    for (const m of migrations) {
      if (done.has(m.name)) continue;
      await pool.query(m.sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [m.name]);
      logger.info({ migration: m.name }, 'migration applied');
    }

    logger.info('БД инициализирована');
  } catch (err) {
    logger.error({ err: err.message }, 'Ошибка инициализации БД');
  }
};

// ─── APP SETUP ─────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// ─── SOCKET.IO ─────────────────────────────────────────────────────────────

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(',').map(o => o.trim()),
    credentials: true,
  },
});

// Authenticate socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
    || socket.handshake.headers?.cookie?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1];
  if (!token) return next(new Error('unauthorized'));
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return next(new Error('unauthorized'));
    socket.data.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  logger.debug({ userId: user.id }, 'socket connected');

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    logger.debug({ userId: user.id, roomId }, 'joined room');
  });

  socket.on('send_message', async ({ roomId, text }) => {
    if (!roomId || !text?.trim()) return;
    const safeText = clean(text.trim()).slice(0, 2000);
    try {
      const r = await pool.query(
        'SELECT name FROM users WHERE id = $1', [user.id]
      );
      const senderName = r.rows[0]?.name || 'Пользователь';
      const result = await pool.query(
        `INSERT INTO chat_messages (room_id, sender_id, sender_name, text)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [roomId, user.id, senderName, safeText]
      );
      const msg = result.rows[0];
      io.to(roomId).emit('new_message', {
        id: msg.id,
        roomId,
        senderId: user.id,
        senderName,
        text: safeText,
        time: new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        createdAt: msg.created_at,
      });
    } catch (err) {
      logger.error({ err: err.message }, 'socket send_message error');
    }
  });

  socket.on('typing', ({ roomId }) => {
    socket.to(roomId).emit('typing', { userId: user.id });
  });

  socket.on('disconnect', () => {
    logger.debug({ userId: user.id }, 'socket disconnected');
  });
});

// ─── SECURITY HEADERS ──────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; script-src 'self'");
  }
  next();
});

// ─── REQUEST LOGGER ────────────────────────────────────────────────────────

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

// ─── CORS ──────────────────────────────────────────────────────────────────

app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── FILE UPLOADS ──────────────────────────────────────────────────────────

['uploads', 'uploads/images', 'uploads/videos', 'uploads/docs'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const makeStorage = (subdir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `./uploads/${subdir}`),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const imageUpload = multer({
  storage: makeStorage('images'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true) : cb(new Error('Только изображения (jpg, png, webp, gif)'));
  },
});

const videoUpload = multer({
  storage: makeStorage('videos'),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.avi'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true) : cb(new Error('Только видео (mp4, mov, webm, avi)'));
  },
});

const docUpload = multer({
  storage: makeStorage('docs'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true) : cb(new Error('Только изображения или PDF'));
  },
});

// Фото авто и видео — публичные
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// KYC документы — только владелец или admin
app.get('/uploads/docs/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const result = await pool.query(
      'SELECT user_id FROM kyc_documents WHERE file_url LIKE $1',
      [`%${filename}`]
    );
    const doc = result.rows[0];
    if (!doc) return res.status(404).json({ error: 'Документ не найден' });

    const isOwner = doc.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    const filePath = path.resolve(__dirname, 'uploads', 'docs', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    res.sendFile(filePath);
  } catch (err) {
    logger.error({ err: err.message }, 'kyc doc access error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── RATE LIMITER ──────────────────────────────────────────────────────────

const authAttempts = new Map();
const rateLimit = (maxAttempts, windowMs) => (req, res, next) => {
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const attempts = (authAttempts.get(key) || []).filter(t => now - t < windowMs);
  if (attempts.length >= maxAttempts) {
    return res.status(429).json({ error: 'Слишком много запросов. Подождите немного.' });
  }
  attempts.push(now);
  authAttempts.set(key, attempts);
  next();
};

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────

const authenticateToken = (req, res, next) => {
  // Check cookie first, then Authorization header (backwards compat)
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || headerToken;

  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Optional auth (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const authHeader = req.headers['authorization'];
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      req.user = err ? null : user;
      next();
    });
  } else {
    req.user = null;
    next();
  }
};

// ─── ROLE CHECK MIDDLEWARE ─────────────────────────────────────────────────

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.sendStatus(401);
  if (!roles.includes(req.user.role)) {
    logger.warn({ userId: req.user.id, role: req.user.role, required: roles, path: req.path }, 'access denied');
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  next();
};

// ─── ANTI-FRAUD HELPERS ───────────────────────────────────────────────────

const logFraudEvent = async (userId, ip, eventType, details = {}, score = 0) => {
  try {
    await pool.query(
      `INSERT INTO fraud_events (user_id, ip, event_type, score, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, ip || null, eventType, score, JSON.stringify(details)]
    );
    if (userId) {
      await pool.query(
        'UPDATE users SET fraud_score = fraud_score + $1 WHERE id = $2',
        [score, userId]
      );
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'fraud log failed');
  }
};

// ─── PAGINATION HELPER ─────────────────────────────────────────────────────

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// ─── AUTH ──────────────────────────────────────────────────────────────────

const setCookieJWT = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

app.post('/api/v1/auth/register', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  const email = clean(req.body.email?.trim());
  const name = clean(req.body.name?.trim());
  const role = clean(req.body.role?.trim()) || 'Клиент';
  const { password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
  }
  const validRoles = ['Клиент', 'Поставщик', 'Посредник'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, role, name, email, level, is_verified',
      [name, email, hashed, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
    setCookieJWT(res, token);

    sendEmail(email, 'Добро пожаловать в LSAUTO', `
      <h2>Привет, ${name}!</h2>
      <p>Вы успешно зарегистрировались на платформе LSAUTO как <b>${role}</b>.</p>
    `);

    logger.info({ userId: user.id, role }, 'user registered');
    res.json({ success: true, token, user });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Этот email уже зарегистрирован' });
    } else {
      logger.error({ err: err.message }, 'register error');
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

app.post('/api/v1/auth/login', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  const email = clean(req.body.email?.trim());
  const { password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  try {
    const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = r.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logFraudEvent(user?.id, ip, 'failed_login', { email }, 1);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (user.fraud_score >= 20) {
      logger.warn({ userId: user.id, fraudScore: user.fraud_score }, 'high fraud score blocked');
      return res.status(403).json({ error: 'Аккаунт заблокирован. Обратитесь в поддержку.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
    setCookieJWT(res, token);

    logger.info({ userId: user.id }, 'user logged in');
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, level: user.level, is_verified: user.is_verified },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'login error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ success: true });
});

app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, email, role, level, is_verified, fraud_score, city, description, phone, photo_url, experience, rating FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(r.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'me error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── CARS ──────────────────────────────────────────────────────────────────

app.get('/api/v1/cars', optionalAuth, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = ['status = $1'];
  const params = ['approved'];

  if (req.query.brand) {
    params.push(`%${clean(req.query.brand)}%`);
    conditions.push(`brand ILIKE $${params.length}`);
  }
  if (req.query.city) {
    params.push(`%${clean(req.query.city)}%`);
    conditions.push(`city ILIKE $${params.length}`);
  }
  if (req.query.minPrice) {
    params.push(Number(req.query.minPrice));
    conditions.push(`price >= $${params.length}`);
  }
  if (req.query.maxPrice) {
    params.push(Number(req.query.maxPrice));
    conditions.push(`price <= $${params.length}`);
  }
  if (req.query.year) {
    params.push(Number(req.query.year));
    conditions.push(`year = $${params.length}`);
  }
  if (req.query.minYear) {
    params.push(Number(req.query.minYear));
    conditions.push(`year >= $${params.length}`);
  }
  if (req.query.maxYear) {
    params.push(Number(req.query.maxYear));
    conditions.push(`year <= $${params.length}`);
  }
  if (req.query.transmission) {
    params.push(clean(req.query.transmission));
    conditions.push(`transmission = $${params.length}`);
  }
  if (req.query.fuel) {
    params.push(clean(req.query.fuel));
    conditions.push(`fuel = $${params.length}`);
  }
  if (req.query.origin) {
    params.push(clean(req.query.origin));
    conditions.push(`origin = $${params.length}`);
  }
  if (req.query.search) {
    params.push(`%${clean(req.query.search)}%`);
    const n = params.length;
    conditions.push(`(brand ILIKE $${n} OR model ILIKE $${n} OR city ILIKE $${n})`);
  }

  const where = conditions.join(' AND ');
  const sort = ['price_asc', 'price_desc', 'year_desc', 'year_asc'].includes(req.query.sort)
    ? { price_asc: 'price ASC', price_desc: 'price DESC', year_desc: 'year DESC', year_asc: 'year ASC' }[req.query.sort]
    : 'id DESC';

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM cars WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM cars WHERE ${where} ORDER BY ${sort} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error({ err: err.message }, 'cars get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/cars', authenticateToken, async (req, res) => {
  const brand = clean(req.body.brand);
  const model = clean(req.body.model);
  const { year, price, origin, transmission, fuel, mileage, city, description, images } = req.body;
  const safeCity = clean(city);
  const safeDesc = clean(description);

  if (!brand || !model || !price) {
    return res.status(400).json({ error: 'Укажите марку, модель и цену' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO cars (brand, model, year, price, origin, transmission, fuel, mileage, city, description, images, user_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'approved') RETURNING *`,
      [brand, model, year, price, origin, transmission, fuel, mileage || 0, safeCity, safeDesc,
       JSON.stringify(images || []), req.user.id]
    );
    logger.info({ carId: result.rows[0].id, userId: req.user.id }, 'car created');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'cars post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/v1/cars/:id', authenticateToken, async (req, res) => {
  const brand = clean(req.body.brand);
  const model = clean(req.body.model);
  const safeCity = clean(req.body.city);
  const safeDesc = clean(req.body.description);
  const { year, price, origin, transmission, fuel, mileage, images } = req.body;

  if (!brand || !model || !price) {
    return res.status(400).json({ error: 'Укажите марку, модель и цену' });
  }
  try {
    const result = await pool.query(
      `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, origin=$5, transmission=$6,
       fuel=$7, mileage=$8, city=$9, description=$10, images=$11
       WHERE id=$12 AND user_id=$13 RETURNING *`,
      [brand, model, year, price, origin, transmission, fuel, mileage || 0,
       safeCity, safeDesc, JSON.stringify(images || []), req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Объявление не найдено или нет доступа' });
    logger.info({ carId: req.params.id, userId: req.user.id }, 'car updated');
    res.json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'car update error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// My cars — все статусы (только владелец)
app.get('/api/v1/cars/my', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM cars WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM cars WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'cars/my error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Single car by ID
app.get('/api/v1/cars/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Автомобиль не найден' });
    const car = result.rows[0];
    if (car.status !== 'approved') {
      if (!req.user || (req.user.id !== car.user_id && req.user.role !== 'admin')) {
        return res.status(404).json({ error: 'Автомобиль не найден' });
      }
    }
    res.json(car);
  } catch (err) {
    logger.error({ err: err.message }, 'car/:id error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Delete own car
app.delete('/api/v1/cars/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cars WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Объявление не найдено или нет доступа' });
    logger.info({ carId: req.params.id, userId: req.user.id }, 'car deleted');
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'car delete error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/v1/cars/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  const valid = ['approved', 'rejected', 'pending'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' });
  try {
    await pool.query('UPDATE cars SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'car status error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── UPLOAD ────────────────────────────────────────────────────────────────

const buildUrl = (req, filepath) => {
  const protocol = isProd ? 'https' : req.protocol;
  return `${protocol}://${req.get('host')}/${filepath}`;
};

app.post('/api/v1/upload', authenticateToken, imageUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  res.json({ url: buildUrl(req, `uploads/images/${req.file.filename}`) });
});

app.post('/api/v1/upload/video', authenticateToken, videoUpload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Видео не получено' });
  const url = buildUrl(req, `uploads/videos/${req.file.filename}`);
  logger.info({ userId: req.user.id, filename: req.file.filename }, 'video uploaded');
  res.json({ url });
});

app.post('/api/v1/upload/kyc', authenticateToken, docUpload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Документ не получен' });
  const url = buildUrl(req, `uploads/docs/${req.file.filename}`);
  const docType = clean(req.body.docType) || 'passport';
  try {
    await pool.query(
      'INSERT INTO kyc_documents (user_id, doc_type, file_url) VALUES ($1,$2,$3)',
      [req.user.id, docType, url]
    );
    logger.info({ userId: req.user.id, docType }, 'kyc document uploaded');
    res.json({ url, status: 'pending' });
  } catch (err) {
    logger.error({ err: err.message }, 'kyc upload error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── REQUESTS ──────────────────────────────────────────────────────────────

app.get('/api/v1/requests', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const isAdmin = req.user.role === 'admin';
  try {
    const countRes = isAdmin
      ? await pool.query('SELECT COUNT(*) FROM requests')
      : await pool.query('SELECT COUNT(*) FROM requests WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countRes.rows[0].count);
    const result = isAdmin
      ? await pool.query('SELECT * FROM requests ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
      : await pool.query('SELECT * FROM requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'requests get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/requests', authenticateToken, async (req, res) => {
  const brand = clean(req.body.brand);
  const model = clean(req.body.model);
  const city = clean(req.body.city);
  const comment = clean(req.body.comment);
  const { budget, year } = req.body;

  if (!brand || !model) {
    return res.status(400).json({ error: 'Укажите марку и модель' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO requests (user_id, brand, model, budget, year_range, city, comment)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, brand, model, budget || 0, year || null, city || null, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'requests post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── FAVORITES ─────────────────────────────────────────────────────────────

app.get('/api/v1/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT car_id FROM favorites WHERE user_id = $1', [req.user.id]);
    res.json(result.rows.map(r => r.car_id));
  } catch (err) {
    logger.error({ err: err.message }, 'favorites get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/favorites', authenticateToken, async (req, res) => {
  const { carId } = req.body;
  if (!carId) return res.status(400).json({ error: 'carId обязателен' });
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, car_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, carId]
    );
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'favorites post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/v1/favorites/:carId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND car_id = $2', [req.user.id, req.params.carId]);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'favorites delete error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── DEALS ─────────────────────────────────────────────────────────────────

app.get('/api/v1/deals', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM deals WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM deals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'deals get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/deals', authenticateToken, async (req, res) => {
  const carName = clean(req.body.carName);
  const escrowAmount = Number(req.body.escrowAmount) || 0;
  if (!carName) return res.status(400).json({ error: 'carName обязателен' });
  try {
    const result = await pool.query(
      `INSERT INTO deals (user_id, car_name, escrow_amount, escrow_status)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, carName, escrowAmount, escrowAmount > 0 ? 'held' : 'none']
    );
    logger.info({ dealId: result.rows[0].id, userId: req.user.id }, 'deal created');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'deals post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/v1/deals/:id/escrow', authenticateToken, async (req, res) => {
  const { escrowStatus } = req.body;
  const valid = ['none', 'held', 'released', 'refunded'];
  if (!valid.includes(escrowStatus)) return res.status(400).json({ error: 'Недопустимый статус escrow' });
  try {
    const result = await pool.query(
      'UPDATE deals SET escrow_status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [escrowStatus, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Сделка не найдена' });
    res.json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'escrow update error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── POSTS ─────────────────────────────────────────────────────────────────

app.get('/api/v1/posts', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'posts get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/posts', authenticateToken, requireRole('Поставщик', 'Посредник', 'admin'), async (req, res) => {
  const title = clean(req.body.title);
  const text = clean(req.body.text);
  const type = clean(req.body.type) || 'new';
  const image = req.body.image || null;

  if (!title || !text) return res.status(400).json({ error: 'Заголовок и текст обязательны' });
  try {
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const supplierName = userResult.rows[0]?.name || 'Поставщик';
    const result = await pool.query(
      `INSERT INTO posts (supplier_id, supplier_name, type, title, text, image)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, supplierName, type, title, text, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'posts post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/v1/posts/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND supplier_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Пост не найден или нет доступа' });
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'post delete error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Пост не найден' });
    res.json({ likes: result.rows[0].likes });
  } catch (err) {
    logger.error({ err: err.message }, 'post like error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── VLOGS ─────────────────────────────────────────────────────────────────

app.get('/api/v1/vlogs', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM vlogs');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM vlogs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'vlogs get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/vlogs', authenticateToken, requireRole('Поставщик', 'admin'), async (req, res) => {
  const title = clean(req.body.title);
  const description = clean(req.body.description);
  const { video_url, thumbnail } = req.body;

  if (!title || !video_url) return res.status(400).json({ error: 'Заголовок и ссылка на видео обязательны' });
  try {
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const supplierName = userResult.rows[0]?.name || 'Поставщик';
    const result = await pool.query(
      `INSERT INTO vlogs (supplier_id, supplier_name, title, description, video_url, thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, supplierName, title, description || null, video_url, thumbnail || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'vlogs post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/vlogs/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE vlogs SET views = views + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── CHAT HISTORY ──────────────────────────────────────────────────────────

app.get('/api/v1/chat/:roomId', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM chat_messages WHERE room_id = $1', [req.params.roomId]
    );
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE room_id = $1
       ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
      [req.params.roomId, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'chat history error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── FRAUD ─────────────────────────────────────────────────────────────────

app.get('/api/v1/fraud/events', authenticateToken, requireRole('admin'), async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM fraud_events');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT fe.*, u.name as user_name FROM fraud_events fe LEFT JOIN users u ON fe.user_id = u.id ORDER BY fe.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'fraud events error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/v1/fraud/report', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.body.targetUserId);
  const reason = clean(req.body.reason) || 'manual_report';
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId обязателен' });
  await logFraudEvent(targetUserId, req.ip, 'user_report', { reportedBy: req.user.id, reason }, 2);
  res.json({ success: true });
});

// ─── SUPPLIERS (USER INFO) ─────────────────────────────────────────────────

app.get('/api/v1/suppliers', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'Поставщик'`);
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT id, name, email, level, is_verified, city, description, experience, phone, photo_url, rating, created_at
       FROM users WHERE role = 'Поставщик' ORDER BY level DESC, created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'suppliers get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/v1/suppliers/city/:city', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const city = clean(req.params.city);
  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'Поставщик' AND city ILIKE $1`, [`%${city}%`]
    );
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT id, name, email, level, is_verified, city, description, experience, phone, photo_url, rating, created_at
       FROM users WHERE role = 'Поставщик' AND city ILIKE $1 ORDER BY level DESC LIMIT $2 OFFSET $3`,
      [`%${city}%`, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'suppliers by city error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/v1/suppliers/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, name, email, level, is_verified, city, description, experience, phone, photo_url, rating, created_at
       FROM users WHERE id = $1 AND role = 'Поставщик'`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Поставщик не найден' });
    res.json(r.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'supplier get by id error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/v1/suppliers/:id/verify', authenticateToken, requireRole('admin'), async (req, res) => {
  const { is_verified } = req.body;
  try {
    await pool.query('UPDATE users SET is_verified = $1 WHERE id = $2', [!!is_verified, req.params.id]);
    logger.info({ supplierId: req.params.id, is_verified }, 'supplier verification updated');
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'verify error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── PROFILE ───────────────────────────────────────────────────────────────

app.put('/api/v1/profile', authenticateToken, async (req, res) => {
  const name = clean(req.body.name?.trim());
  const city = clean(req.body.city?.trim());
  const description = clean(req.body.description?.trim());
  const experience = clean(req.body.experience?.trim());
  const phone = clean(req.body.phone?.trim());
  const photo_url = req.body.photo_url || null;

  if (!name) return res.status(400).json({ error: 'Имя обязательно' });
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, city=$2, description=$3, experience=$4, phone=$5,
       photo_url=COALESCE($6, photo_url) WHERE id=$7
       RETURNING id, name, email, role, level, is_verified, city, description, experience, phone, photo_url, rating`,
      [name, city || null, description || null, experience || null, phone || null, photo_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'profile update error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── TRADE-IN ──────────────────────────────────────────────────────────────

app.post('/api/v1/trade-in', optionalAuth, async (req, res) => {
  const brand = clean(req.body.brand);
  const model = clean(req.body.model);
  const { year, mileage, condition, owners, estimateMin, estimateMax } = req.body;

  if (!brand || !model) return res.status(400).json({ error: 'Марка и модель обязательны' });
  try {
    const result = await pool.query(
      `INSERT INTO trade_in_requests (user_id, brand, model, year, mileage, condition, owners, estimate_min, estimate_max)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user?.id || null, brand, model, year || null, mileage || 0,
       condition || 'Хорошее', owners || 1, estimateMin || null, estimateMax || null]
    );
    logger.info({ tradeInId: result.rows[0].id }, 'trade-in request created');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err: err.message }, 'trade-in post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── ADMIN STATS ───────────────────────────────────────────────────────────

app.get('/api/v1/admin/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [usersRes, pendingCarsRes, dealsRes, chatRes, revenueRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users`),
      pool.query(`SELECT COUNT(*) FROM cars WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM deals`),
      pool.query(`SELECT COUNT(DISTINCT room_id) FROM chat_messages`),
      pool.query(`SELECT COALESCE(SUM(escrow_amount), 0) AS total FROM deals WHERE escrow_status = 'released'`),
    ]);
    res.json({
      usersCount: parseInt(usersRes.rows[0].count),
      pendingCars: parseInt(pendingCarsRes.rows[0].count),
      dealsCount: parseInt(dealsRes.rows[0].count),
      activeChats: parseInt(chatRes.rows[0].count),
      revenue: parseFloat(revenueRes.rows[0].total),
    });
  } catch (err) {
    logger.error({ err: err.message }, 'admin stats error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/v1/admin/users', authenticateToken, requireRole('admin'), async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT id, name, email, role, level, is_verified, city, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    logger.error({ err: err.message }, 'admin users error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── CUSTOMS CALCULATOR ────────────────────────────────────────────────────

const CUSTOMS_RATES = {
  duty_rates: { 'Китай': 0.15, 'Европа': 0.20, 'Южная Корея': 0.15 },
  excise_per_hp: [
    { maxHp: 90, rate: 0 }, { maxHp: 150, rate: 45 },
    { maxHp: 200, rate: 437 }, { maxHp: 300, rate: 714 },
    { maxHp: 400, rate: 1218 }, { maxHp: Infinity, rate: 1584 },
  ],
  recycling_fee: { first: 3400, subsequent: 6000 },
};

app.post('/api/v1/customs/calculate', async (req, res) => {
  const { carPrice, origin, enginePower, isFirstCar } = req.body;
  if (!carPrice || !enginePower) {
    return res.status(400).json({ error: 'carPrice и enginePower обязательны' });
  }
  const price = Number(carPrice);
  const hp = Number(enginePower);
  const dutyRate = CUSTOMS_RATES.duty_rates[origin] || 0.15;
  const duty = price * dutyRate;
  const exciseRate = CUSTOMS_RATES.excise_per_hp.find(r => hp <= r.maxHp)?.rate || 0;
  const excise = exciseRate * hp;
  const recycling = isFirstCar ? CUSTOMS_RATES.recycling_fee.first : CUSTOMS_RATES.recycling_fee.subsequent;
  const vatBase = price + duty + excise;
  const vat = vatBase * 0.2;
  const total = duty + excise + recycling + vat;
  res.json({
    carPrice: price,
    duty: Math.round(duty),
    excise: Math.round(excise),
    recyclingFee: recycling,
    vat: Math.round(vat),
    total: Math.round(total),
    totalWithCar: Math.round(price + total),
  });
});

// ─── HEALTH ────────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  let dbOk = false;
  try { await pool.query('SELECT 1'); dbOk = true; } catch (_) {}
  res.json({ status: 'ok', db: dbOk, time: new Date().toISOString(), env: isProd ? 'production' : 'development' });
});

// ─── SPA FALLBACK ──────────────────────────────────────────────────────────

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  logger.error({ err: err.message, path: req.path }, 'unhandled error');
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ─── START ─────────────────────────────────────────────────────────────────

initDB().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT, env: isProd ? 'production' : 'development' }, 'LSAuto server started');
    if (!isProd) logger.info('Frontend: http://127.0.0.1:5173 (npm run dev)');
  });
});

// ─── GRACEFUL SHUTDOWN ──────────────────────────────────────────────────────

const shutdown = async (signal) => {
  logger.info({ signal }, 'shutdown signal received');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    try {
      await pool.end();
      logger.info('DB pool closed');
    } catch (err) {
      logger.warn({ err: err.message }, 'DB pool close error');
    }
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
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
