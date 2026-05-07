
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

/**
 * LSAuto ULTIMATE BACKEND - Production Ready for MVP
 */

const app = express();
const PORT = 3000;
const SECRET_KEY = 'lsauto_secret_ultra_key';
const DB_FILE = './database.json';

// Настройка хранилища для фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Делаем папку с фото доступной по ссылке

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return { cars: [], requests: [], users: [], chats: [], reviews: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Middleware для защиты маршрутов
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/v1/auth/register', async (req, res) => {
  const db = readDB();
  const { email, password, role, name } = req.body;
  
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword, role, name };
  
  db.users.push(newUser);
  writeDB(db);
  
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY);
  res.json({ success: true, token, user: { id: newUser.id, email, role, name } });
});

app.post('/api/v1/auth/login', async (req, res) => {
  const db = readDB();
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }
  
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
  res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// --- MEDIA API (Загрузка фото) ---
app.post('/api/v1/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('Файл не загружен');
  res.json({ url: `http://localhost:${PORT}/uploads/${req.file.filename}` });
});

// --- CARS API ---
app.get('/api/v1/cars', (req, res) => res.json(readDB().cars));

app.post('/api/v1/cars', authenticateToken, (req, res) => {
  const db = readDB();
  const newCar = { 
    id: `car-${Date.now()}`, 
    ...req.body, 
    userId: req.user.id // Привязываем машину к создателю
  };
  db.cars.push(newCar);
  writeDB(db);
  res.status(201).json(newCar);
});

// --- CHATS API ---
app.post('/api/v1/messages/send', authenticateToken, (req, res) => {
  const db = readDB();
  const { chatId, text } = req.body;
  let chat = db.chats.find(c => c.id === chatId);
  
  if (!chat) {
    chat = { id: chatId, history: [] };
    db.chats.push(chat);
  }
  
  chat.history.push({ 
    senderId: req.user.id, 
    text, 
    time: new Date().toISOString() 
  });
  
  writeDB(db);
  res.json({ success: true, chat });
});

app.listen(PORT, () => {
  console.log(`\x1b[35m%s\x1b[0m`, `=========================================`);
  console.log(`\x1b[35m%s\x1b[0m`, `LSAuto ULTIMATE BACKEND IS LIVE!`);
  console.log(`\x1b[35m%s\x1b[0m`, `Security: Bcrypt Hashing Active`);
  console.log(`\x1b[35m%s\x1b[0m`, `Storage: File System (database.json)`);
  console.log(`\x1b[35m%s\x1b[0m`, `URL: http://localhost:${PORT}`);
  console.log(`\x1b[35m%s\x1b[0m`, `=========================================`);
});
