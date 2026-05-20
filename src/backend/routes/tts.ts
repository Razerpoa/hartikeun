import type { Express } from 'express';
import { Modality } from '@google/genai';
import { error as logError } from '../logger.js';
import type { GoogleGenAI } from '@google/genai';
import { ttsSchema } from '../validation.js';
import { ZodError } from 'zod';

interface RouteDeps {
  ai: GoogleGenAI;
}

export function registerTtsRoute(app: Express, deps: RouteDeps): void {
  const { ai } = deps;

  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voice } = ttsSchema.parse(req.body);

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
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({ 
          error: 'validation_failed', 
          details: e.issues.map(err => ({ path: err.path, message: err.message })) 
        });
      }
      
      logError('Error generating speech:', req.requestId, e);

      // Map Gemini errors
      const status = e.status || e.statusCode;
      if (status === 429) {
        return res.status(429).json({ error: 'Too many requests to AI service. Please try again later.' });
      }
      if (status === 400) {
        return res.status(400).json({ error: 'Invalid request to AI service.' });
      }
      if (status === 401 || status === 403) {
        return res.status(500).json({ error: 'AI service configuration error.' });
      }

      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });
}
