import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Translator } from '../Translator';
import { BrowserRouter } from 'react-router-dom';

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
});
