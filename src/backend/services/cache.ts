import fs from 'fs';
import path from 'path';
import { LRUCache } from 'lru-cache';
import { config } from '../config.js';
import { info, error as logError } from '../logger.js';

const cachePath = path.join(process.cwd(), config.CACHE_PATH);

export type WordCacheValue = Record<string, unknown>;
export type WordCache = LRUCache<string, WordCacheValue>;

let persistTimer: ReturnType<typeof setInterval> | null = null;

export function createCache(): WordCache {
  const cache = new LRUCache<string, WordCacheValue>({
    max: config.LRU_MAX,
    ttl: config.LRU_TTL_MS,
  });

  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf-8');
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, value] of Object.entries(parsed)) {
            cache.set(key, value as WordCacheValue);
          }
        }
        info(`Loaded ${cache.size} items from ${config.CACHE_PATH}`);
      }
    } catch (e) {
      logError('Error loading word cache:', undefined, e);
    }
  }

  return cache;
}

export function persistCache(cache: WordCache): void {
  try {
    const obj: Record<string, WordCacheValue> = {};
    for (const [key, value] of cache.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(cachePath, JSON.stringify(obj, null, 2));
    info(`Persisted ${cache.size} items to ${config.CACHE_PATH}`);
  } catch (e) {
    logError('Error saving word cache:', undefined, e);
  }
}

export function startCachePersistence(cache: WordCache): void {
  if (persistTimer) return;
  persistTimer = setInterval(() => persistCache(cache), 5 * 60 * 1000);
  if (persistTimer && typeof persistTimer === 'object' && 'unref' in persistTimer) {
    persistTimer.unref();
  }
}

export function stopCachePersistence(): void {
  if (persistTimer) {
    clearInterval(persistTimer);
    persistTimer = null;
  }
}

// Legacy export removed. Use createCache and persistCache directly.
