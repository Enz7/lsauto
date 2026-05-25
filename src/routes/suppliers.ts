import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

const SUPPLIER_FIELDS = 'id, name, email, level, is_verified, city, description, experience, phone, photo_url, rating, created_at';

router.get('/', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'Поставщик'`);
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT ${SUPPLIER_FIELDS} FROM users WHERE role = 'Поставщик' ORDER BY level DESC, created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'suppliers get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/city/:city', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const city = clean(req.params.city);
  try {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'Поставщик' AND city ILIKE $1`, [`%${city}%`]
    );
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT ${SUPPLIER_FIELDS} FROM users WHERE role = 'Поставщик' AND city ILIKE $1 ORDER BY level DESC LIMIT $2 OFFSET $3`,
      [`%${city}%`, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'suppliers by city error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ${SUPPLIER_FIELDS} FROM users WHERE id = $1 AND role = 'Поставщик'`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Поставщик не найден' });
    res.json(r.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'supplier get by id error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.patch('/:id/verify', authenticateToken, requireRole('admin', 'Администратор'), async (req, res) => {
  const { is_verified } = req.body;
  try {
    await pool.query('UPDATE users SET is_verified = $1 WHERE id = $2', [!!is_verified, req.params.id]);
    logger.info({ supplierId: req.params.id, is_verified }, 'supplier verification updated');
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'verify error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
