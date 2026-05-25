import { Router } from 'express';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';
import { parsePagination } from '../utils/pagination.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);
  const conditions = ['status = $1'];
  const params: unknown[] = ['approved'];

  if (req.query.brand) { params.push(`%${clean(req.query.brand as string)}%`); conditions.push(`brand ILIKE $${params.length}`); }
  if (req.query.city) { params.push(`%${clean(req.query.city as string)}%`); conditions.push(`city ILIKE $${params.length}`); }
  if (req.query.minPrice) { params.push(Number(req.query.minPrice)); conditions.push(`price >= $${params.length}`); }
  if (req.query.maxPrice) { params.push(Number(req.query.maxPrice)); conditions.push(`price <= $${params.length}`); }
  if (req.query.year) { params.push(Number(req.query.year)); conditions.push(`year = $${params.length}`); }
  if (req.query.minYear) { params.push(Number(req.query.minYear)); conditions.push(`year >= $${params.length}`); }
  if (req.query.maxYear) { params.push(Number(req.query.maxYear)); conditions.push(`year <= $${params.length}`); }
  if (req.query.transmission) { params.push(clean(req.query.transmission as string)); conditions.push(`transmission = $${params.length}`); }
  if (req.query.fuel) { params.push(clean(req.query.fuel as string)); conditions.push(`fuel = $${params.length}`); }
  if (req.query.origin) { params.push(clean(req.query.origin as string)); conditions.push(`origin = $${params.length}`); }
  if (req.query.search) {
    params.push(`%${clean(req.query.search as string)}%`);
    const n = params.length;
    conditions.push(`(brand ILIKE $${n} OR model ILIKE $${n} OR city ILIKE $${n})`);
  }

  const where = conditions.join(' AND ');
  const sortMap: Record<string, string> = { price_asc: 'price ASC', price_desc: 'price DESC', year_desc: 'year DESC', year_asc: 'year ASC' };
  const sort = sortMap[req.query.sort as string] || 'id DESC';

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM cars WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM cars WHERE ${where} ORDER BY ${sort} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'cars get error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const brand = clean(req.body.brand);
  const model = clean(req.body.model);
  const { year, price, origin, transmission, fuel, mileage, city, description, images } = req.body;
  const safeCity = clean(city);
  const safeDesc = clean(description);

  if (!brand || !model || !price) {
    return res.status(400).json({ error: 'Укажите марку, модель и цену' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO cars (brand, model, year, price, origin, transmission, fuel, mileage, city, description, images, user_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [brand, model, year, price, origin, transmission, fuel, mileage || 0, safeCity, safeDesc,
       JSON.stringify(images || []), req.user!.id, 'approved']
    );
    logger.info({ carId: result.rows[0].id, userId: req.user!.id }, 'car created');
    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'cars post error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.patch('/:id/status', authenticateToken, requireRole('admin', 'Администратор'), async (req, res) => {
  const { status } = req.body;
  const valid = ['approved', 'rejected', 'pending'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' });
  try {
    await pool.query('UPDATE cars SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'car status error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
