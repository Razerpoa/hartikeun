import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { config } from './src/backend/config.js';
import { info, warn, error as logError } from './src/backend/logger.js';
import { ai } from './src/backend/services/gemini.js';
import { loadCache, saveCache as saveCacheImpl } from './src/backend/services/cache.js';
import { createApp } from './src/backend/app.js';

dotenv.config();

// Load custom dictionary once at startup
let customDictText = '';
const dictLoadPath = path.join(process.cwd(), 'custom_dictionary.json');
if (fs.existsSync(dictLoadPath)) {
  try {
    const dictContent = fs.readFileSync(dictLoadPath, 'utf-8');
    const dict = JSON.parse(dictContent);
    if (Object.keys(dict).length > 0) {
      customDictText = `\nCustom Dictionary (Priority):\n${JSON.stringify(dict)}`;
    }
  } catch (e) {
    logError('Error parsing custom dictionary:', e);
  }
}

// Load word cache at startup
const wordCache = loadCache();
const saveCache = () => saveCacheImpl(wordCache);

// Graceful shutdown handlers
const handleShutdown = (signal: string) => {
  info(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

async function startServer() {
  const app = await createApp({ ai, wordCache, saveCache, customDictText });

  app.listen(config.PORT, '0.0.0.0', () => {
    info(`Server running on http://localhost:${config.PORT}`);
  });
}

startServer();
