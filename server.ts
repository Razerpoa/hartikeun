import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const GEMINI_MODEL = 'gemini-3.1-flash-lite';

  function normalizeSlang(text: string): string {
    return text.split(/(\s+)/).map(w => {
      if (/^\s+$/.test(w)) return w;
      
      // If word is entirely repeated vowels (e.g., aa, aaaa, uuu)
      // Normalize to exactly 2 characters (e.g., "aa", "ee") to preserve meanings like 'aa' (kakak)
      if (/^([aeiou])\1+$/i.test(w)) {
        return w.substring(0, 2).toLowerCase();
      }

      // Otherwise:
      // 1. Collapse sequences of repeated vowels (2 or more) to 1.
      let n = w.replace(/([aeiou])\1+/gi, '$1');
      // 2. Collapse sequences of 3 or more identical consonants to 1.
      n = n.replace(/([^aeiou\s\d])\1{2,}/gi, '$1');
      
      return n;
    }).join('');
  }

  // Canonical key for fuzzy matching in cache (e.g., e/eu equivalence)
  function getCacheKey(prefix: string, lang: string, text: string, extra?: string): string {
    let canonical = text.trim().toLowerCase();
    
    // Normalize e/eu variations: hideung <-> hideng
    // We only do this for words > 3 chars to avoid confusing 'teh'/'teu'
    const words = canonical.split(/\s+/).map(w => {
      if (w.length > 3) {
        return w.replace(/eu/g, 'e');
      }
      return w;
    });
    
    canonical = words.join(' ');
    
    return `${prefix}:${lang}${extra ? ':' + extra : ''}:${canonical}`;
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const cachePath = path.join(process.cwd(), 'word_cache.json');
  let wordCache: Record<string, any> = {};
  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf-8');
      if (data) {
        wordCache = JSON.parse(data);
        console.log(`[Cache] Loaded ${Object.keys(wordCache).length} items from word_cache.json`);
      }
    } catch (e) {
      console.error('Error loading word cache:', e);
    }
  }

  const saveCache = () => {
    try {
      fs.writeFileSync(cachePath, JSON.stringify(wordCache, null, 2));
    } catch (e) {
      console.error('Error saving word cache:', e);
    }
  };

  // API routes
  app.post('/api/transform', async (req, res) => {
    const { text, tone = 50, lang = 'id', image } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: 'Text or image is required' });
    }

    const normalizedText = text ? normalizeSlang(text) : '(No text provided, see image)';
    
    // We don't cache image requests for now to avoid huge cache files
    const cacheKey = !image ? getCacheKey('transform', lang, normalizedText, tone.toString()) : null;
    if (cacheKey && wordCache[cacheKey]) {
      console.log(`[Cache Hit] Transform: ${cacheKey}`);
      return res.json(wordCache[cacheKey]);
    }

    if (cacheKey) {
      console.log(`[Cache Miss] Fetching transform: ${cacheKey}`);
    } else {
      console.log(`[Multi-modal] Fetching transform with image`);
    }

    const targetLangName = lang === 'id' ? 'Indonesian' : 'English';

    const baseSystemPrompt = `You are an expert Indonesian linguist and cultural bridge.
Decode casual regional dialects (Sundanese, Javanese, Betawi, etc.), slang, or text from images into standard forms.

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
      "translations": { "formal_indonesian": "Teman, nanti jadi bermain tidak?", "daily_indonesian": "Bro, nanti jadi main gak?", "professional_english": "Hey, are we hanging out later?" },
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
... (existing logic for single text chunks) ...
Translations required:
1. formal_indonesian: Standard Baku (strictly KBBI/EYD).
2. daily_indonesian: Modern, natural casual (Gen Z/Millennial style, e.g., 'aja', 'nggak', 'udah').
3. professional_english: High-quality, clear English.

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

    try {
      let customDictText = '';
      const dictPath = path.join(process.cwd(), 'custom_dictionary.json');
      if (fs.existsSync(dictPath)) {
        try {
          const dictContent = fs.readFileSync(dictPath, 'utf-8');
          const dict = JSON.parse(dictContent);
          if (Object.keys(dict).length > 0) {
            customDictText = `\nCustom Dictionary (Priority):\n${JSON.stringify(dict)}`;
          }
        } catch (e) {
          console.error('Error parsing custom dictionary:', e);
        }
      }

      const contents: any[] = [{
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
        model: GEMINI_MODEL,
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
            required: ['analysis', 'translations', 'vocabulary_breakdown']
          }
        }
      });

      const result = JSON.parse(response.text);
      if (cacheKey) {
        wordCache[cacheKey] = result;
        saveCache();
      }
      res.json(result);
    } catch (error) {
      console.error('Error transforming text:', error);
      res.status(500).json({ error: 'Failed to transform text' });
    }
  });

  app.post('/api/word-details', async (req, res) => {
    const { word, lang = 'id', context = '' } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const normalizedWord = normalizeSlang(word);
    // Include context in cache key to allow context-specific deep dives if the AI adjusts focus
    const cacheKey = getCacheKey('details', lang, normalizedWord, context ? `ctx:${context.substring(0, 20)}` : undefined);
    
    if (wordCache[cacheKey]) {
      console.log(`[Cache Hit] Word details: ${cacheKey}`);
      return res.json(wordCache[cacheKey]);
    }

    console.log(`[Cache Miss] Fetching word details: ${cacheKey} (Original: ${word})`);
    const targetLangName = lang === 'id' ? 'Indonesian' : 'English';

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
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

      const result = JSON.parse(response.text);
      wordCache[cacheKey] = result;
      saveCache();
      res.json(result);
    } catch (error) {
      console.error('Error fetching word details:', error);
      res.status(500).json({ error: 'Failed to fetch word details' });
    }
  });

  app.post('/api/tts', async (req, res) => {
    const { text, voice = 'Kore' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: 'No audio generated' });
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
