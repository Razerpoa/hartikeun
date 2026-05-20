import express from 'express';
import type { Express } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { registerTransformRoute } from './routes/transform.js';
import { registerWordDetailsRoute } from './routes/wordDetails.js';
import { registerTtsRoute } from './routes/tts.js';
import type { GoogleGenAI } from '@google/genai';
import type { WordCache } from './services/cache.js';

export interface AppDeps {
  ai: GoogleGenAI;
  wordCache: WordCache;
  customDictText: string;
}

export async function createApp(deps: AppDeps): Promise<Express> {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Health endpoint (no auth / rate limit)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Rate limiter for Gemini API routes: 30 req/min per IP
  const geminiLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });

  // API routes with rate limiting
  app.use('/api/transform', geminiLimiter);
  app.use('/api/word-details', geminiLimiter);
  app.use('/api/tts', geminiLimiter);

  registerTransformRoute(app, deps);
  registerWordDetailsRoute(app, deps);
  registerTtsRoute(app, deps);

  // Global error handler (must be after all routes)
  app.use(errorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
