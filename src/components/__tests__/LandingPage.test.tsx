import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LandingPage } from '../LandingPage';
import { BrowserRouter } from 'react-router-dom';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('cycles EN subjects from friends\' → clients → son\'s → others\' → boss\' → date\'s → sibling\'', () => {
    render(
      <BrowserRouter>
        <LandingPage uiLang="en" setUiLang={vi.fn()} />
      </BrowserRouter>
    );

    const enSubjects = ["friends'", 'clients', "son's", "others'", "boss'", "date's", "sibling's"];
    const enBubbleMarkers = [
      /gyatt.*skibidi rizzler/i,
      /ASAP.*align.*stakeholders.*synergy/i,
      /mewing.*Roblox.*rizz.*Ohio/i,
      /kapurung.*delicious/i,
      /circle back.*offline.*sync.*deliverables/i,
      /slide.*DMs.*ghosting.*red flag/i,
      /clutched.*1v5.*ranked/i,
    ];

    for (let i = 0; i < enSubjects.length; i++) {
      // Check subject word appears in the hero
      expect(screen.getByText(enSubjects[i])).toBeInTheDocument();

      // Check matching bubble conversation text appears
      expect(screen.getByText(enBubbleMarkers[i])).toBeInTheDocument();

      if (i < enSubjects.length - 1) {
        act(() => {
          vi.advanceTimersByTime(4000);
        });
      }
    }
  });

  it('cycles ID subjects from temen → clients → putra → lainnya → bos → gebetan → adik', () => {
    render(
      <BrowserRouter>
        <LandingPage uiLang="id" setUiLang={vi.fn()} />
      </BrowserRouter>
    );

    const idSubjects = ['temen', 'clients', 'putra', 'lainnya', 'bos', 'gebetan', 'adik'];
    const idBubbleMarkers = [
      /khodam.*maung sigma/i,
      /ASAP.*align.*stakeholders.*biar synergy/i,
      /mewing.*mukbang.*Roblox.*kece parah/i,
      /kapurung.*mamaku/i,
      /CC-in.*stakeholder.*one-on-one/i,
      /chat.*ghosting.*red flag.*bestie/i,
      /FTL.*turnamen.*direct message/i,
    ];

    for (let i = 0; i < idSubjects.length; i++) {
      // Check subject word appears in the hero
      expect(screen.getByText(idSubjects[i])).toBeInTheDocument();

      // Check matching bubble conversation text appears
      expect(screen.getByText(idBubbleMarkers[i])).toBeInTheDocument();

      if (i < idSubjects.length - 1) {
        act(() => {
          vi.advanceTimersByTime(4000);
        });
      }
    }
  });
});
