import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';

export const logFraudEvent = async (
  userId: number | null,
  ip: string | null,
  eventType: string,
  details: Record<string, unknown> = {},
  score = 0
) => {
  try {
    await pool.query(
      `INSERT INTO fraud_events (user_id, ip, event_type, score, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, ip || null, eventType, score, JSON.stringify(details)]
    );
    if (userId) {
      await pool.query(
        'UPDATE users SET fraud_score = fraud_score + $1 WHERE id = $2',
        [score, userId]
      );
    }
  } catch (err: unknown) {
    logger.warn({ err: (err as Error).message }, 'fraud log failed');
  }
};
