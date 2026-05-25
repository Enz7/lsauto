import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { clean } from '../utils/clean.js';
import { COOKIE_NAME } from '../middleware/auth.js';

const SECRET_KEY = process.env.JWT_SECRET as string;

export const setupSocket = (app: Express, allowedOrigin: string) => {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map(o => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
      || socket.handshake.headers?.cookie?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1];
    if (!token) return next(new Error('unauthorized'));
    jwt.verify(token, SECRET_KEY, (err: Error | null, user: unknown) => {
      if (err) return next(new Error('unauthorized'));
      socket.data.user = user as { id: number; role: string };
      next();
    });
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as { id: number };
    logger.debug({ userId: user.id }, 'socket connected');

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      logger.debug({ userId: user.id, roomId }, 'joined room');
    });

    socket.on('send_message', async ({ roomId, text }: { roomId: string; text: string }) => {
      if (!roomId || !text?.trim()) return;
      const safeText = clean(text.trim()).slice(0, 2000);
      try {
        const r = await pool.query('SELECT name FROM users WHERE id = $1', [user.id]);
        const senderName = r.rows[0]?.name || 'Пользователь';
        const result = await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, sender_name, text)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [roomId, user.id, senderName, safeText]
        );
        const msg = result.rows[0];
        io.to(roomId).emit('new_message', {
          id: msg.id, roomId,
          senderId: user.id, senderName, text: safeText,
          time: new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
          createdAt: msg.created_at,
        });
      } catch (err: unknown) {
        logger.error({ err: (err as Error).message }, 'socket send_message error');
      }
    });

    socket.on('typing', ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit('typing', { userId: user.id });
    });

    socket.on('disconnect', () => {
      logger.debug({ userId: user.id }, 'socket disconnected');
    });
  });

  return httpServer;
};
