import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/', authenticateToken, requireRole('Поставщик', 'Посредник', 'admin', 'Администратор'), async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM requests');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM requests ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'requests get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
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
      [req.user!.id, brand, model, budget || 0, year || null, city || null, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'requests post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
