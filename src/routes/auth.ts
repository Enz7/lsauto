import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/logger.js';
import { authenticateToken, COOKIE_NAME } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { clean } from '../utils/clean.js';
import { sendEmail } from '../services/email.js';
import { logFraudEvent } from '../services/fraud.js';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET as string;
const REFRESH_COOKIE = 'lsauto_refresh';

const setCookieJWT = (res: import('express').Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
};

const setCookieRefresh = (res: import('express').Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

router.post('/register', authRateLimit, async (req, res) => {
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
    const accessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = crypto.randomUUID();
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshHash, expiresAt]
    );
    setCookieJWT(res, accessToken);
    setCookieRefresh(res, refreshToken);

    sendEmail(email, 'Добро пожаловать в LSAUTO', `
      <h2>Привет, ${name}!</h2>
      <p>Вы успешно зарегистрировались на платформе LSAUTO как <b>${role}</b>.</p>
    `);

    logger.info({ userId: user.id, role }, 'user registered');
    res.json({ success: true, user });
  } catch (err: unknown) {
    const e = err as { code?: string; message: string };
    if (e.code === '23505') {
      res.status(400).json({ error: 'Этот email уже зарегистрирован' });
    } else {
      logger.error({ err: e.message }, 'register error');
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  const email = clean(req.body.email?.trim());
  const { password } = req.body;
  const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  try {
    const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = r.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logFraudEvent(user?.id || null, ip, 'failed_login', { email }, 1);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (user.fraud_score >= 20) {
      logger.warn({ userId: user.id, fraudScore: user.fraud_score }, 'high fraud score blocked');
      return res.status(403).json({ error: 'Аккаунт заблокирован. Обратитесь в поддержку.' });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = crypto.randomUUID();
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshHash, expiresAt]
    );
    setCookieJWT(res, accessToken);
    setCookieRefresh(res, refreshToken);

    logger.info({ userId: user.id }, 'user logged in');
    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, level: user.level, is_verified: user.is_verified },
    });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'login error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/logout', (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]).catch(() => {});
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true });
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) return res.sendStatus(401);

  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  try {
    const r = await pool.query(
      `SELECT rt.user_id, u.role FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [hash]
    );
    if (!r.rows[0]) return res.sendStatus(401);
    const { user_id, role } = r.rows[0];
    const newAccess = jwt.sign({ id: user_id, role }, SECRET_KEY, { expiresIn: '15m' });
    setCookieJWT(res, newAccess);
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'refresh error');
    res.sendStatus(401);
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, email, role, level, is_verified, fraud_score, city, description, phone FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(r.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'me error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
