import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

export const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
    timeout: config.REQUEST_TIMEOUT_MS,
  },
});
