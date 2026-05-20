import type { Express } from 'express';
import { Type } from '@google/genai';
import { config } from '../config.js';
import { info, error as logError } from '../logger.js';
import { normalizeSlang, getCacheKey } from '../utils.js';
import type { GoogleGenAI } from '@google/genai';
import type { WordCache } from '../services/cache.js';
import { transformSchema } from '../validation.js';
import { ZodError } from 'zod';

interface RouteDeps {
  ai: GoogleGenAI;
  wordCache: WordCache;
  customDictText: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function registerTransformRoute(app: Express, deps: RouteDeps): void {
  const { ai, wordCache, customDictText } = deps;

  app.post('/api/transform', async (req, res) => {
    try {
      const { text, tone, lang, image } = transformSchema.parse(req.body);

      if (image && typeof image === 'string') {
        const base64Data = image.split(',')[1] || image;
        const decodedLength = Buffer.byteLength(base64Data, 'base64');
        if (decodedLength > MAX_IMAGE_SIZE_BYTES) {
          return res.status(400).json({ error: 'Image must be at most 5MB after decoding' });
        }
      }

      const normalizedText = text ? normalizeSlang(text) : '(No text provided, see image)';

      // We don't cache image requests for now to avoid huge cache files
      const cacheKey = !image ? getCacheKey('transform', lang, normalizedText, tone.toString()) : null;
      if (cacheKey) {
        const cached = wordCache.get(cacheKey);
        if (cached) {
          info(`[Cache Hit] Transform: ${cacheKey}`, req.requestId);
          return res.json(cached);
        }
      }

      if (cacheKey) {
        info(`[Cache Miss] Fetching transform: ${cacheKey}`, req.requestId);
      } else {
        info(`[Multi-modal] Fetching transform with image`, req.requestId);
      }

      const targetLangName = lang === 'id' ? 'Indonesian' : 'English';

      const baseSystemPrompt = `You are a Polyglot Cultural Interpreter — an expert linguist specializing in Indonesian languages and cross-cultural communication.

YOUR ROLE:
Decode any human language input — including casual regional dialects (Sundanese, Javanese, Betawi, etc.), slang, foreign languages, or text from images — into accurate translations with cultural context and educational insights.

LANGUAGE DETECTION & ROUTING:
1. Detect the input language/variety. Set "language_variety" to the detected language/variety name (e.g., "Japanese", "Sundanese", "English", "Indonesian Standard", "Javanese").
2. IF the input is NON-INDONESIAN (not Indonesian, Malay, or any regional Indonesian language/dialect):
   - Translate INTO these three forms:
     a) formal_indonesian: Standard Baku Indonesian (strictly KBBI/EYD).
     b) daily_indonesian: Natural casual Indonesian (Gen Z/Millennial style, e.g., 'aja', 'nggak', 'udah').
     c) professional_english: Clear, natural English.
   - Provide vocabulary_breakdown explaining the original foreign words.
3. IF the input IS INDONESIAN (including Sundanese, Javanese, Betawi, Minang, Balinese, etc.):
   - Provide the same three output forms (Standard Indonesian, Daily Indonesian, Professional English).
   - Provide deep dialect analysis in the analysis section (detected_dialect, regional origin).

CHAT DETECTION & EXTRACTION:
If the input is a screenshot of a messaging app (WhatsApp, iMessage, etc.) OR if the text input contains tags like [SELF] or [OTHER]:
1. Set 'is_chat' to true.
2. Extract the conversation sequence into the 'messages' array.
3. DIFFERENTIATION RULES:
   - IMAGE: Messages on the RIGHT side are 'self' (the user). Messages on the LEFT side are 'other' (the friend/contact).
   - TEXT: Lines starting with [SELF]: or [ME]: are 'self'. Lines starting with [OTHER]: or [FRIEND]: are 'other'.
4. NAME EXTRACTION:
   - TRY to extract the name of the sender for 'other' messages. In screenshots, this is often at the very top of the screen (the header/contact name).
   - If a name is found, use it as 'sender_name'.
   - If no name is found, 'sender_name' MUST default to "Friend" (or "Teman" if Indonesian).
   - For 'self' messages, 'sender_name' is ALWAYS "You" (or "Kamu").
5. ACCURACY: Capture the EXACT text, including typos and emoji.
6. VOCABULARY: For every message, break down slang/dialect words into 'vocabulary_breakdown'.

GIBBERISH & VALIDITY CHECK:
Before doing any translation:
1. Check if the input is absolute gibberish (e.g., 'asdfghjkl', '123123123', or just repeating characters) or completely irrelevant noise.
2. If it is gibberish, set 'is_gibberish' to true and provide a helpful 'error_message' in the target language (why it's considered invalid).
3. If it is valid text (even the most obscure local slang), proceed as normal.

JSON EXAMPLE FOR CHAT:
{
  "is_chat": true,
  "messages": [
    {
      "sender_type": "other",
      "original_text": "Cuy, ntar ulin moal?",
      "translations": { "formal_indonesian": "Teman, nanti jadi bermain tidak?", "daily_indonesian": "Cuy, nanti jadi main gak?", "professional_english": "Hey, are we hanging out later?" },
      "vocabulary_breakdown": [
        { "original_word": "ulin", "meaning_and_context": "Bermain (Sundanese)", "is_proper_name": false },
        { "original_word": "moal", "meaning_and_context": "Tidak akan (Sundanese)", "is_proper_name": false }
      ]
    },
    {
      "sender_type": "self",
      "original_text": "Hayu atuh, gaskeun!",
      "translations": { "formal_indonesian": "Ayo kalau begitu, mari kita laksanakan!", "daily_indonesian": "Ayo, langsung aja!", "professional_english": "Let's go, I'm down!" },
      "vocabulary_breakdown": [
        { "original_word": "gaskeun", "meaning_and_context": "Slang for 'let's do it' / accelerate", "is_proper_name": false }
      ]
    }
  ],
  "analysis": { ... }
}

FOR ALL INPUTS (NON-CHAT):
Translations required:
1. formal_indonesian: Standard Baku (strictly KBBI/EYD).
2. daily_indonesian: Modern, natural casual (Gen Z/Millennial style, e.g., 'aja', 'nggak', 'udah').
3. professional_english: High-quality, clear English.

VOCABULARY BREAKDOWN:
Always provide vocabulary_breakdown for key words — foreign words, slang, dialect terms, or interesting expressions. Each entry must include the original word, its meaning and context, and whether it is a proper name.

LEARNING INSIGHT:
For every input, provide a "learning_insight" object containing:
- detected_language: The detected source language/variety name.
- language_family: The language family (e.g., "Austronesian", "Japonic", "Germanic", "Sino-Tibetan", "Atlantic-Congo").
- cultural_context: A brief interesting cultural note about the expression or language (1-2 sentences).
- comparison_table: Array comparing the phrase across languages with "phrase", "language", and "meaning" fields.

CUSTOM DICTIONARY REFERENCE:
The user message may include custom dictionary entries at the end. Use these as authoritative references for specific word translations.

CRITICAL RULES:
1. Preserve original line breaks and newlines exactly.
2. Identify Proper Names: If a word is a person's name, identify it as a Proper Name.
3. If an image is provided, analyze it first. If it's a chat, extract EVERYTHING.
4. All analysis fields must be in ${targetLangName}.`;

      let toneInstruction = '';
      const level = Number(tone);

      if (level <= 33) {
        toneInstruction = 'Tone: Casual/Friendly/Warm.';
      } else if (level <= 66) {
        toneInstruction = 'Tone: Balanced/Polite/Respectful.';
      } else {
        toneInstruction = 'Tone: Precise/Informative/Literal.';
      }

      const contents: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> }> = [{
        role: 'user',
        parts: [
          { text: `Input: "${normalizedText}"\n${toneInstruction}${customDictText}` }
        ]
      }];

      if (image && typeof image === 'string') {
        const base64Data = image.split(',')[1] || image;
        const mimeTypeMatch = image.match(/^data:([^;]+);/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

        contents[0].parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: contents,
        config: {
          systemInstruction: baseSystemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_chat: { type: Type.BOOLEAN },
              is_gibberish: { type: Type.BOOLEAN },
              error_message: { type: Type.STRING },
              language_variety: { type: Type.STRING },
              learning_insight: {
                type: Type.OBJECT,
                properties: {
                  detected_language: { type: Type.STRING },
                  language_family: { type: Type.STRING },
                  cultural_context: { type: Type.STRING },
                  comparison_table: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phrase: { type: Type.STRING },
                        language: { type: Type.STRING },
                        meaning: { type: Type.STRING }
                      },
                      required: ['phrase', 'language', 'meaning']
                    }
                  }
                },
                required: ['detected_language']
              },
              messages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sender_type: { type: Type.STRING }, // 'self' or 'other'
                    sender_name: { type: Type.STRING },
                    original_text: { type: Type.STRING },
                    translations: {
                      type: Type.OBJECT,
                      properties: {
                        formal_indonesian: { type: Type.STRING },
                        daily_indonesian: { type: Type.STRING },
                        professional_english: { type: Type.STRING }
                      },
                      required: ['formal_indonesian', 'daily_indonesian', 'professional_english']
                    },
                    vocabulary_breakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          original_word: { type: Type.STRING },
                          meaning_and_context: { type: Type.STRING },
                          is_proper_name: { type: Type.BOOLEAN }
                        },
                        required: ['original_word', 'meaning_and_context', 'is_proper_name']
                      }
                    }
                  },
                  required: ['sender_type', 'sender_name', 'original_text', 'translations', 'vocabulary_breakdown']
                }
              },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  detected_dialect: { type: Type.STRING },
                  input_tone_rating: { type: Type.STRING },
                  core_intent_summary: { type: Type.STRING },
                  context: { type: Type.STRING },
                  detected_tone: { type: Type.STRING }
                },
                required: ['detected_dialect', 'input_tone_rating', 'core_intent_summary', 'context', 'detected_tone']
              },
              translations: {
                type: Type.OBJECT,
                properties: {
                  formal_indonesian: { type: Type.STRING },
                  daily_indonesian: { type: Type.STRING },
                  professional_english: { type: Type.STRING }
                },
                required: ['formal_indonesian', 'daily_indonesian', 'professional_english']
              },
              vocabulary_breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original_word: { type: Type.STRING },
                    meaning_and_context: { type: Type.STRING },
                    is_proper_name: { type: Type.BOOLEAN }
                  },
                  required: ['original_word', 'meaning_and_context', 'is_proper_name']
                }
              }
            },
            required: ['analysis', 'translations', 'vocabulary_breakdown', 'language_variety', 'learning_insight']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from AI model');
      }
      const result = JSON.parse(responseText);
      if (cacheKey) {
        wordCache.set(cacheKey, result);
      }
      res.json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'validation_failed', 
          details: error.issues.map(e => ({ path: e.path, message: e.message })) 
        });
      }
      
      logError('Error transforming text:', req.requestId, error);

      // Map Gemini errors
      const status = error.status || error.statusCode;
      if (status === 429) {
        return res.status(429).json({ error: 'Too many requests to AI service. Please try again later.' });
      }
      if (status === 400) {
        return res.status(400).json({ error: 'Invalid request to AI service.' });
      }
      if (status === 401 || status === 403) {
        return res.status(500).json({ error: 'AI service configuration error.' });
      }

      res.status(500).json({ error: 'Failed to transform text' });
    }
  });
}
