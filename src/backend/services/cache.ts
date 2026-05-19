import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { info, error as logError } from '../logger.js';

const cachePath = path.join(process.cwd(), config.CACHE_PATH);

export function loadCache(): Record<string, unknown> {
  const wordCache: Record<string, unknown> = {};
  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf-8');
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.assign(wordCache, parsed);
        }
        info(`Loaded ${Object.keys(wordCache).length} items from ${config.CACHE_PATH}`);
      }
    } catch (e) {
      logError('Error loading word cache:', e);
    }
  }
  return wordCache;
}

export function saveCache(wordCache: Record<string, unknown>): void {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(wordCache, null, 2));
  } catch (e) {
    logError('Error saving word cache:', e);
  }
}
