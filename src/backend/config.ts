import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CACHE_PATH: process.env.CACHE_PATH || 'word_cache.json',
  LRU_MAX: parseInt(process.env.LRU_MAX || '1000', 10),
  LRU_TTL_MS: parseInt(process.env.LRU_TTL_MS || '86400000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
} as const;

export type Config = typeof config;
