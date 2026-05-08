
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Настройка путей для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Явно указываем путь к .env файлу
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'lsauto_secret_ultra_key';

console.log('--- Инициализация сервера ---');
console.log('DATABASE_URL из .env:', process.env.DATABASE_URL ? 'Найден (скрыто)' : 'НЕ НАЙДЕН!');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

app.use(cors());
app.use(express.json());

// Логгер
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] Запрос: ${req.method} ${req.url}`);
  next();
});

// Маршрут регистрации
app.post('/api/v1/auth/register', async (req, res) => {
  console.log('Получены данные для регистрации:', req.body);
  const { email, password, role, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, role, name',
      [name || 'Пользователь', email, hashedPassword, role]
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);
    console.log('✅ Пользователь успешно создан в PostgreSQL!');
    res.json({ success: true, token, user });
  } catch (err) {
    console.error('❌ Ошибка записи в базу:', err.message);
    res.status(500).json({ message: 'Ошибка БД: ' + err.message });
  }
});

app.get('/api/v1/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Запуск
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(`СЕРВЕР ЛС-АВТО ЗАПУЩЕН`);
  console.log(`Адрес: http://127.0.0.1:${PORT}`);
  console.log(`=========================================\n`);
});
