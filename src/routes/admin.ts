import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/stats', authenticateToken, requireRole('admin', 'Администратор'), async (req, res) => {
  try {
    const [usersRes, pendingCarsRes, dealsRes, chatRes, revenueRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users`),
      pool.query(`SELECT COUNT(*) FROM cars WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM deals`),
      pool.query(`SELECT COUNT(DISTINCT room_id) FROM chat_messages`),
      pool.query(`SELECT COALESCE(SUM(escrow_amount), 0) AS total FROM deals WHERE escrow_status = 'released'`),
    ]);
    res.json({
      usersCount: parseInt(usersRes.rows[0].count),
      pendingCars: parseInt(pendingCarsRes.rows[0].count),
      dealsCount: parseInt(dealsRes.rows[0].count),
      activeChats: parseInt(chatRes.rows[0].count),
      revenue: parseFloat(revenueRes.rows[0].total),
    });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'admin stats error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/users', authenticateToken, requireRole('admin', 'Администратор'), async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT id, name, email, role, level, is_verified, city, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'admin users error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
