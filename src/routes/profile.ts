import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';

const router = Router();

router.put('/', authenticateToken, async (req, res) => {
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
      [name, city || null, description || null, experience || null, phone || null, photo_url, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'profile update error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
