import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fileTypeFromFile } from 'file-type';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { clean } from '../utils/clean.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

['uploads', 'uploads/images', 'uploads/videos', 'uploads/docs'].forEach(dir => {
  const full = path.join(__dirname, '..', '..', dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const makeStorage = (subdir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadsRoot, subdir)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });

const imageUpload = multer({
  storage: makeStorage('images'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Только изображения (jpg, png, webp, gif)'));
  },
});

const videoUpload = multer({
  storage: makeStorage('videos'),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.avi'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Только видео (mp4, mov, webm, avi)'));
  },
});

const docUpload = multer({
  storage: makeStorage('docs'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    allowed.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Только изображения или PDF'));
  },
});

const buildUrl = (req: import('express').Request, filepath: string) => {
  const protocol = isProd ? 'https' : req.protocol;
  return `${protocol}://${req.get('host')}/${filepath}`;
};

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const KYC_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

router.post('/', authenticateToken, imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  const filePath = req.file.path;
  const type = await fileTypeFromFile(filePath);
  if (!type || !IMAGE_MIMES.includes(type.mime)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Недопустимый тип файла' });
  }
  res.json({ url: buildUrl(req, `uploads/images/${req.file.filename}`) });
});

router.post('/video', authenticateToken, videoUpload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Видео не получено' });
  const url = buildUrl(req, `uploads/videos/${req.file.filename}`);
  logger.info({ userId: req.user!.id, filename: req.file.filename }, 'video uploaded');
  res.json({ url });
});

router.post('/kyc', authenticateToken, docUpload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Документ не получен' });
  const filePath = req.file.path;
  const type = await fileTypeFromFile(filePath);
  if (!type || !KYC_MIMES.includes(type.mime)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Для KYC разрешены только jpeg, png, pdf' });
  }
  const url = buildUrl(req, `uploads/docs/${req.file.filename}`);
  const docType = clean(req.body.docType) || 'passport';
  try {
    await pool.query(
      'INSERT INTO kyc_documents (user_id, doc_type, file_url) VALUES ($1,$2,$3)',
      [req.user!.id, docType, url]
    );
    logger.info({ userId: req.user!.id, docType }, 'kyc document uploaded');
    res.json({ url, status: 'pending' });
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'kyc upload error');
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
