import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { logFraudEvent } from '../services/fraud.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/events', authenticateToken, requireRole('admin', 'Администратор'), async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM fraud_events');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      'SELECT fe.*, u.name as user_name FROM fraud_events fe LEFT JOIN users u ON fe.user_id = u.id ORDER BY fe.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'fraud events error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/report', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.body.targetUserId);
  const reason = clean(req.body.reason) || 'manual_report';
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId обязателен' });
  await logFraudEvent(targetUserId, req.ip || null, 'user_report', { reportedBy: req.user!.id, reason }, 2);
  res.json({ success: true });
});

export default router;
