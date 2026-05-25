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
    const countRes = await pool.query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'posts get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, requireRole('Поставщик', 'Посредник'), async (req, res) => {
  const title = clean(req.body.title);
  const text = clean(req.body.text);
  const supplierName = clean(req.body.supplierName) || 'Поставщик';
  const type = clean(req.body.type) || 'new';
  const image = req.body.image || null;

  if (!title || !text) return res.status(400).json({ error: 'Заголовок и текст обязательны' });
  try {
    const result = await pool.query(
      `INSERT INTO posts (supplier_id, supplier_name, type, title, text, image)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user!.id, supplierName, type, title, text, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'posts post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND supplier_id = $2 RETURNING id',
      [req.params.id, req.user!.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Пост не найден или нет доступа' });
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'post delete error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Пост не найден' });
    res.json({ likes: result.rows[0].likes });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'post like error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
