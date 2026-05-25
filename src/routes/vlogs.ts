import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/', async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM vlogs');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM vlogs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'vlogs get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, requireRole('Поставщик'), async (req, res) => {
  const title = clean(req.body.title);
  const description = clean(req.body.description);
  const supplierName = clean(req.body.supplierName) || 'Поставщик';
  const { video_url, thumbnail } = req.body;

  if (!title || !video_url) return res.status(400).json({ error: 'Заголовок и ссылка на видео обязательны' });
  try {
    const result = await pool.query(
      `INSERT INTO vlogs (supplier_id, supplier_name, title, description, video_url, thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user!.id, supplierName, title, description || null, video_url, thumbnail || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'vlogs post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE vlogs SET views = views + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
