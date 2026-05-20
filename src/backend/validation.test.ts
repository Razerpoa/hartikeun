import { describe, it, expect } from 'vitest';
import { transformSchema, wordDetailsSchema, ttsSchema } from './validation';

describe('Validation Schemas', () => {
  describe('transformSchema', () => {
    it('validates a valid text request', () => {
      const input = { text: 'hello', tone: 50, lang: 'en' };
      const result = transformSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('validates a valid image request', () => {
      const input = { image: 'data:image/png;base64,xxx' };
      const result = transformSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('fails when both text and image are missing', () => {
      const input = { tone: 50 };
      const result = transformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('fails when text is too long', () => {
      const input = { text: 'a'.repeat(5001) };
      const result = transformSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('wordDetailsSchema', () => {
    it('validates a valid request', () => {
      const input = { word: 'naon', lang: 'id' };
      const result = wordDetailsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('fails when word is missing', () => {
      const input = { lang: 'id' };
      const result = wordDetailsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('ttsSchema', () => {
    it('validates a valid request', () => {
      const input = { text: 'hello', voice: 'Kore' };
      const result = ttsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('fails with invalid voice', () => {
      const input = { text: 'hello', voice: 'InvalidVoice' };
      const result = ttsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
