import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = randomUUID().split('-')[0]; // 8-char ID
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
