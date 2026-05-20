import { z } from 'zod';

export const transformSchema = z.object({
  text: z.string().max(5000).optional(),
  tone: z.coerce.number().min(0).max(100).default(50),
  lang: z.enum(['id', 'en']).default('id'),
  image: z.string().optional(),
}).refine(data => data.text || data.image, {
  message: "Text or image is required",
  path: ["text"],
});

export const wordDetailsSchema = z.object({
  word: z.string().min(1),
  lang: z.enum(['id', 'en']).default('id'),
  context: z.string().optional(),
});

export const ttsSchema = z.object({
  text: z.string().min(1),
  voice: z.enum(['Kore', 'Leda', 'Aoede', 'Puck', 'Charon', 'Fenrir', 'Arctos']).default('Kore'),
});

export type TransformInput = z.infer<typeof transformSchema>;
export type WordDetailsInput = z.infer<typeof wordDetailsSchema>;
export type TtsInput = z.infer<typeof ttsSchema>;
