import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';

// Hoisted mocks: these run before any module code
const mockGenerateContent = vi.hoisted(() => vi.fn());
const mockViteCreateServer = vi.hoisted(() => vi.fn().mockResolvedValue({
  middlewares: vi.fn(),
}));

vi.mock('vite', () => ({
  createServer: mockViteCreateServer,
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: function () {
    return {
      models: { generateContent: mockGenerateContent },
    };
  },
  Type: {
    OBJECT: 'object',
    STRING: 'string',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
  },
  Modality: {
    AUDIO: 'audio',
  },
}));

import type { Express } from 'express';
import { GoogleGenAI } from '@google/genai';
import { LRUCache } from 'lru-cache';
import type { WordCacheValue } from '../../services/cache.js';
import { createApp } from '../../app.js';

describe('API Routes', () => {
  let app: Express;
  let wordCache: LRUCache<string, WordCacheValue>;

  beforeAll(async () => {
    wordCache = new LRUCache<string, WordCacheValue>({ max: 100 });
    app = await createApp({
      ai: new GoogleGenAI({ apiKey: 'test' }) as never,
      wordCache: wordCache as never,
      customDictText: '',
    });
  });

  beforeEach(() => {
    mockGenerateContent.mockReset();
    wordCache.clear();
  });

  describe('GET /api/health', () => {
    it('returns 200 with status and uptime', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('POST /api/transform', () => {
    const transformResponse = {
      is_chat: false,
      is_gibberish: false,
      translations: {
        formal_indonesian: 'Halo',
        daily_indonesian: 'Halo',
        professional_english: 'Hello',
      },
      analysis: {
        detected_dialect: 'Standard',
        input_tone_rating: 'Neutral',
        core_intent_summary: 'Greeting',
        context: 'Casual greeting',
        detected_tone: 'Neutral',
      },
      vocabulary_breakdown: [],
    };

    it('returns 200 with transformed text', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(transformResponse),
      });

      const res = await request(app)
        .post('/api/transform')
        .send({ text: 'halo', tone: 50, lang: 'id' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(transformResponse);
    });

    it('returns 400 when text and image are both missing', async () => {
      const res = await request(app)
        .post('/api/transform')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Text or image is required');
    });

    it('returns 400 when text exceeds 5000 characters', async () => {
      const res = await request(app)
        .post('/api/transform')
        .send({ text: 'a'.repeat(5001) });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 500 when AI call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI error'));

      const res = await request(app)
        .post('/api/transform')
        .send({ text: 'halo' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to transform text');
    });
  });

  describe('POST /api/word-details', () => {
    const detailsResponse = {
      word: 'halo',
      pronunciation: '[halo]',
      origin_and_culture: 'Loan word',
      usage_examples: [
        {
          sentence: 'Halo, kumaha damang?',
          translation: 'Hello, how are you?',
          context: 'Greeting',
          dialect: 'Sundanese',
        },
      ],
      synonyms: ['hai'],
      antonyms: ['bye'],
    };

    it('returns 200 with word details', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(detailsResponse),
      });

      const res = await request(app)
        .post('/api/word-details')
        .send({ word: 'halo', lang: 'id' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(detailsResponse);
    });

    it('returns 400 when word is missing', async () => {
      const res = await request(app)
        .post('/api/word-details')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Word is required');
    });

    it('returns 500 when AI call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI error'));

      const res = await request(app)
        .post('/api/word-details')
        .send({ word: 'halo' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch word details');
    });
  });

  describe('POST /api/tts', () => {
    it('returns 200 with audio data', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'base64-encoded-audio',
                  },
                },
              ],
            },
          },
        ],
      });

      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'halo', voice: 'Kore' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('audio', 'base64-encoded-audio');
    });

    it('returns 400 when text is missing', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Text is required');
    });

    it('returns 400 when voice is not in whitelist', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'halo', voice: 'InvalidVoice' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 500 when no audio generated', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'no audio here' }],
            },
          },
        ],
      });

      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'halo' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'No audio generated');
    });

    it('returns 500 when AI call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI error'));

      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'halo' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to generate speech');
    });
  });
});
