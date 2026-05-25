import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT car_id FROM favorites WHERE user_id = $1', [req.user!.id]);
    res.json(result.rows.map((r: { car_id: string }) => r.car_id));
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'favorites get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { carId } = req.body;
  if (!carId) return res.status(400).json({ error: 'carId обязателен' });
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, car_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user!.id, carId]
    );
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'favorites post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:carId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND car_id = $2', [req.user!.id, req.params.carId]);
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'favorites delete error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
