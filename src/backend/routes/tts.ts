import type { Express } from 'express';
import { Modality } from '@google/genai';
import { error as logError } from '../logger.js';
import type { GoogleGenAI } from '@google/genai';

interface RouteDeps {
  ai: GoogleGenAI;
}

// Gemini TTS voice whitelist
const ALLOWED_VOICES = new Set(['Kore', 'Leda', 'Aoede', 'Puck', 'Charon', 'Fenrir', 'Arctos']);

export function registerTtsRoute(app: Express, deps: RouteDeps): void {
  const { ai } = deps;

  app.post('/api/tts', async (req, res) => {
    const { text, voice = 'Kore' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ALLOWED_VOICES.has(voice)) {
      return res.status(400).json({ error: `Voice must be one of: ${[...ALLOWED_VOICES].join(', ')}` });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
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
    } catch (e) {
      logError('Error generating speech:', e);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });
}
