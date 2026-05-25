import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/:roomId', authenticateToken, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM chat_messages WHERE room_id = $1', [req.params.roomId]
    );
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
      [req.params.roomId, limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'chat history error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
