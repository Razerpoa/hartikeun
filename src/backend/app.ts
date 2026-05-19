import express from 'express';
import type { Express } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { registerTransformRoute } from './routes/transform.js';
import { registerWordDetailsRoute } from './routes/wordDetails.js';
import { registerTtsRoute } from './routes/tts.js';
import type { GoogleGenAI } from '@google/genai';

export interface AppDeps {
  ai: GoogleGenAI;
  wordCache: Record<string, unknown>;
  saveCache: () => void;
  customDictText: string;
}

export async function createApp(deps: AppDeps): Promise<Express> {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API routes
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
