import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { optionalAuth } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';

const router = Router();

router.post('/', optionalAuth, async (req, res) => {
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
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'trade-in post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
