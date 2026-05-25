import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'lsauto_jwt';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

const SECRET_KEY = process.env.JWT_SECRET as string;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || headerToken;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err: Error | null, user: unknown) => {
    if (err) return res.sendStatus(403);
    req.user = user as { id: number; role: string };
    next();
  });
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const authHeader = req.headers['authorization'];
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
  if (token) {
    jwt.verify(token, SECRET_KEY, (err: Error | null, user: unknown) => {
      req.user = err ? undefined : (user as { id: number; role: string });
      next();
    });
  } else {
    next();
  }
};

export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
