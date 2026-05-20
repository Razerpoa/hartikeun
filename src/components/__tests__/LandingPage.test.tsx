import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandingPage } from '../LandingPage';
import { BrowserRouter } from 'react-router-dom';

describe('LandingPage', () => {
  it('renders the landing page with CTA button', () => {
    render(
      <BrowserRouter>
        <LandingPage uiLang="en" setUiLang={vi.fn()} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Find out what it means/i)).toBeInTheDocument();
  });

  it('renders cycling conversation bubbles matching the selected language', () => {
    render(
      <BrowserRouter>
        <LandingPage uiLang="en" setUiLang={vi.fn()} />
      </BrowserRouter>
    );

    // With uiLang="en", the first conversation should be the EN version
    // showing a Gen-Z slang exchange about "gyatt" and "skibidi rizzler"
    expect(screen.getByText(/gyatt.*skibidi rizzler/i)).toBeInTheDocument();
  });
});
