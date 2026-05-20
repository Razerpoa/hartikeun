import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Translator } from '../Translator';
import { BrowserRouter } from 'react-router-dom';

const baseResult = {
  is_chat: false,
  is_gibberish: false,
  translations: {
    formal_indonesian: 'Formal ID',
    daily_indonesian: 'Daily ID',
    professional_english: 'English',
  },
  analysis: {
    detected_dialect: 'Standard',
    input_tone_rating: 'Neutral',
    core_intent_summary: 'Test',
    context: 'Test context',
    detected_tone: 'Neutral',
  },
  vocabulary_breakdown: [],
};

describe('Translator', () => {
  it('renders the translator with textarea', () => {
    render(
      <BrowserRouter>
        <Translator 
          uiLang="en" 
          setUiLang={vi.fn()} 
          input="" 
          setInput={vi.fn()} 
          result={null} 
          setResult={vi.fn()} 
          toneLevel={50} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/Enter slang, local greetings, or dialect here/i)).toBeInTheDocument();
    expect(screen.getByText(/Translate Meaning/i)).toBeInTheDocument();
  });

  it('renders Discovery panel when learning_insight is present', () => {
    render(
      <BrowserRouter>
        <Translator 
          uiLang="en" 
          setUiLang={vi.fn()} 
          input="Arigatou" 
          setInput={vi.fn()} 
          result={{
            ...baseResult,
            language_variety: 'Japanese',
            learning_insight: {
              detected_language: 'Japanese',
              cultural_explanation: 'Arigatou is a common Japanese expression of gratitude.',
              etymology: 'From Japanese ありがとう (arigatou).',
            },
          }} 
          setResult={vi.fn()} 
          toneLevel={50} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Language Discovery')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText(/Arigatou is a common Japanese expression/)).toBeInTheDocument();
    expect(screen.getByText(/From Japanese ありがとう/)).toBeInTheDocument();
  });
});
