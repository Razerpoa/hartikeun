export interface ChatMessage {
  sender_type: 'self' | 'other';
  original_text: string;
  translations: {
    formal_indonesian: string;
    daily_indonesian: string;
    professional_english: string;
  };
  vocabulary_breakdown: Array<{
    original_word: string;
    meaning_and_context: string;
    is_proper_name: boolean;
  }>;
}

export interface TransformationResult {
  is_chat?: boolean;
  is_gibberish?: boolean;
  error_message?: string;
  messages?: ChatMessage[];
  analysis: {
    detected_dialect: string;
    input_tone_rating: string;
    core_intent_summary: string;
    context: string;
    detected_tone: string;
  };
  translations: {
    formal_indonesian: string;
    daily_indonesian: string;
    professional_english: string;
  };
  vocabulary_breakdown: Array<{
    original_word: string;
    meaning_and_context: string;
    is_proper_name: boolean;
  }>;
  learning_insight?: {
    detected_language: string;
    cultural_explanation: string;
    etymology?: string;
  };
  language_variety?: string;
}
