import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM deals WHERE user_id = $1', [req.user!.id]);
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM deals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user!.id, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'deals get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const carName = clean(req.body.carName);
  const escrowAmount = Number(req.body.escrowAmount) || 0;
  if (!carName) return res.status(400).json({ error: 'carName обязателен' });
  try {
    const result = await pool.query(
      `INSERT INTO deals (user_id, car_name, escrow_amount, escrow_status)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user!.id, carName, escrowAmount, escrowAmount > 0 ? 'held' : 'none']
    );
    logger.info({ dealId: result.rows[0].id, userId: req.user!.id }, 'deal created');
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'deals post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.patch('/:id/escrow', authenticateToken, async (req, res) => {
  const { escrowStatus } = req.body;
  const valid = ['none', 'held', 'released', 'refunded'];
  if (!valid.includes(escrowStatus)) return res.status(400).json({ error: 'Недопустимый статус escrow' });
  try {
    const result = await pool.query(
      'UPDATE deals SET escrow_status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [escrowStatus, req.params.id, req.user!.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Сделка не найдена' });
    res.json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'escrow update error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
