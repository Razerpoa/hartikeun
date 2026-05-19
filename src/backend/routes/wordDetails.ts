import type { Express } from 'express';
import { Type } from '@google/genai';
import { config } from '../config.js';
import { info, error as logError } from '../logger.js';
import { normalizeSlang, getCacheKey } from '../utils.js';
import type { GoogleGenAI } from '@google/genai';
import type { WordCache } from '../services/cache.js';

interface RouteDeps {
  ai: GoogleGenAI;
  wordCache: WordCache;
}

export function registerWordDetailsRoute(app: Express, deps: RouteDeps): void {
  const { ai, wordCache } = deps;

  app.post('/api/word-details', async (req, res) => {
    const { word, lang = 'id', context = '' } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const normalizedWord = normalizeSlang(word);
    // Include context in cache key to allow context-specific deep dives if the AI adjusts focus
    const cacheKey = getCacheKey('details', lang, normalizedWord, context ? `ctx:${context.substring(0, 20)}` : undefined);

    const cached = wordCache.get(cacheKey);
    if (cached) {
      info(`[Cache Hit] Word details: ${cacheKey}`);
      return res.json(cached);
    }

    info(`[Cache Miss] Fetching word details: ${cacheKey} (Original: ${word})`);
    const targetLangName = lang === 'id' ? 'Indonesian' : 'English';

    try {
      const response = await ai.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: `Input Word: "${normalizedWord}"\nContext provided: "${context}"\nAll explanations must be in ${targetLangName}.`,
        config: {
          systemInstruction: `You are a professional etymologist and socio-linguist. Provide a linguistic deep dive for the provided word/slang.

          CRITICAL RULES:
          1. The 'pronunciation' field must be a strictly CONCISE phonetic guide (e.g., [d͡ʒɤŋ] or a simple rhythmic transcription). Never include long linguistic descriptions.
          2. Context Awareness: Use the provided 'Context' to help identify the primary dialect or intended usage, but if the word is common across multiple dialects, address them all.
          3. Multi-Dialect Handling:
             - If the word is used in multiple dialects (e.g., both Sundanese and Javanese), you MUST provide examples for EACH.
             - Case MANY dialects: provide 1-2 examples PER dialect.
             - Case ONE dialect: provide exactly 3 examples.
          4. Usage examples MUST be written in the natural regional dialect/slang of the word (e.g., if the example is for Sundanese, the sentence must be in Sundanese).
          5. Each example MUST explicitly state its 'dialect' (e.g., "Sundanese", "Javanese", "Betawi").
          6. All other explanations, cultural context, and translations must be in ${targetLangName}.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              pronunciation: { type: Type.STRING },
              origin_and_culture: { type: Type.STRING },
              usage_examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sentence: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    context: { type: Type.STRING },
                    dialect: { type: Type.STRING },
                  },
                  required: ['sentence', 'translation', 'context', 'dialect'],
                },
              },
              synonyms: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              antonyms: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ['word', 'pronunciation', 'origin_and_culture', 'usage_examples', 'synonyms', 'antonyms'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from AI model');
      }
      const result = JSON.parse(responseText);
      wordCache.set(cacheKey, result);
      res.json(result);
    } catch (e) {
      logError('Error fetching word details:', e);
      res.status(500).json({ error: 'Failed to fetch word details' });
    }
  });
}
