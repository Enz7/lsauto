import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const applied = await pool.query('SELECT name FROM migrations');
    const done = new Set(applied.rows.map((r: { name: string }) => r.name));

    const migrations = [
      {
        name: '001_initial',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'Клиент',
            level INT NOT NULL DEFAULT 1,
            is_verified BOOLEAN DEFAULT false,
            fraud_score INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS cars (
            id SERIAL PRIMARY KEY,
            brand VARCHAR(100),
            model VARCHAR(100),
            year INT,
            price DECIMAL(15,2),
            origin VARCHAR(100),
            transmission VARCHAR(100),
            fuel VARCHAR(100),
            mileage INT DEFAULT 0,
            city VARCHAR(255),
            description TEXT,
            images JSONB DEFAULT '[]',
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            budget DECIMAL(15,2) DEFAULT 0,
            year_range VARCHAR(50),
            city VARCHAR(255),
            comment TEXT,
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            car_id VARCHAR(255) NOT NULL,
            UNIQUE(user_id, car_id)
          );
          CREATE TABLE IF NOT EXISTS deals (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            car_name VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'выкуплено',
            escrow_status VARCHAR(50) DEFAULT 'none',
            escrow_amount DECIMAL(15,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            supplier_id INT REFERENCES users(id) ON DELETE SET NULL,
            supplier_name VARCHAR(255),
            type VARCHAR(50) DEFAULT 'new',
            title VARCHAR(500) NOT NULL,
            text TEXT NOT NULL,
            image TEXT,
            likes INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS vlogs (
            id SERIAL PRIMARY KEY,
            supplier_id INT REFERENCES users(id) ON DELETE CASCADE,
            supplier_name VARCHAR(255),
            title VARCHAR(500) NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            thumbnail TEXT,
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            room_id VARCHAR(255) NOT NULL,
            sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            sender_name VARCHAR(255),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS kyc_documents (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            doc_type VARCHAR(50) DEFAULT 'passport',
            file_url TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS fraud_events (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            ip VARCHAR(100),
            fingerprint TEXT,
            event_type VARCHAR(100),
            score INT DEFAULT 0,
            details JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `,
      },
      {
        name: '002_indexes',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
          CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
          CREATE INDEX IF NOT EXISTS idx_cars_city ON cars(city);
          CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
          CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
          CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
          CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
          CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
          CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
          CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
          CREATE INDEX IF NOT EXISTS idx_posts_supplier_id ON posts(supplier_id);
          CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at);
          CREATE INDEX IF NOT EXISTS idx_fraud_events_user_id ON fraud_events(user_id);
          CREATE INDEX IF NOT EXISTS idx_fraud_events_ip ON fraud_events(ip);
          CREATE INDEX IF NOT EXISTS idx_vlogs_supplier_id ON vlogs(supplier_id);
          CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);
        `,
      },
      {
        name: '003_supplier_level_trigger',
        sql: `
          CREATE OR REPLACE FUNCTION update_supplier_level()
          RETURNS TRIGGER AS $$
          DECLARE
            deal_count INT;
            new_level INT;
          BEGIN
            SELECT COUNT(*) INTO deal_count FROM deals WHERE user_id = NEW.user_id;
            new_level := LEAST(8, GREATEST(1,
              CASE
                WHEN deal_count >= 100 THEN 8
                WHEN deal_count >= 50  THEN 7
                WHEN deal_count >= 25  THEN 6
                WHEN deal_count >= 15  THEN 5
                WHEN deal_count >= 8   THEN 4
                WHEN deal_count >= 4   THEN 3
                WHEN deal_count >= 1   THEN 2
                ELSE 1
              END
            ));
            UPDATE users SET level = new_level WHERE id = NEW.user_id;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trg_supplier_level ON deals;
          CREATE TRIGGER trg_supplier_level
            AFTER INSERT ON deals
            FOR EACH ROW EXECUTE FUNCTION update_supplier_level();
        `,
      },
      {
        name: '004_supplier_profile_and_tables',
        sql: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS experience VARCHAR(50) DEFAULT '0 лет';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 5.0;

          CREATE TABLE IF NOT EXISTS trade_in_requests (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            year INT,
            mileage INT DEFAULT 0,
            condition VARCHAR(50) DEFAULT 'Хорошее',
            owners INT DEFAULT 1,
            estimate_min DECIMAL(15,2),
            estimate_max DECIMAL(15,2),
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS news (
            id SERIAL PRIMARY KEY,
            category VARCHAR(50) DEFAULT 'market',
            title VARCHAR(500) NOT NULL,
            excerpt TEXT,
            content TEXT,
            image_url TEXT,
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `,
      },
      {
        name: '005_admin_role',
        sql: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
        `,
      },
      {
        name: '006_refresh_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
          CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
        `,
      },
    ];

    for (const m of migrations) {
      if (done.has(m.name)) continue;
      await pool.query(m.sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [m.name]);
      logger.info({ migration: m.name }, 'migration applied');
    }

    logger.info('БД инициализирована');
  } catch (err: unknown) {
    logger.error({ err: (err as Error).message }, 'Ошибка инициализации БД');
  }
};
