<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hartikeun // ID — Polyglot Indonesian Bridge

<p align="center">
  <strong>Translate any language into Indonesian with cultural insights.</strong><br>
  From regional dialects to Brainrot slang, Gen-Z lingo to foreign languages —<br>
  Hartikeun auto-detects and bridges the gap.
</p>

<p align="center">
  <a href="https://rsvp.withgoogle.com/events/juaravibecoding">
    <img src="https://img.shields.io/badge/JuaraVibeCoding-2026-Google-blue" alt="JuaraVibeCoding 2026">
  </a>
</p>

---

## Features

- **🧠 Polyglot Auto-Detection** — Input anything: Sundanese dialect, Gen-Z slang (`gabut`, `bucin`), Brainrot (`menyala abangku`), or foreign languages (Japanese, English, etc.) — the AI detects and translates TO Indonesian.
- **🌐 Three Translation Levels** — Formal Indonesian (Baku), Daily Indonesian (natural slang), and Clear English.
- **🔍 Word-by-Word Breakdown** — Each significant word gets explained with meaning and cultural context.
- **💬 Chat Analysis** — Paste WhatsApp/chat screenshots; the AI extracts messages, identifies senders, and breaks down slang per message.
- **📖 Discovery Panel** — Educational insights showing detected language, cultural context, and etymology.
- **🖼️ Image Support** — Upload or paste chat screenshots for analysis.
- **🔊 Text-to-Speech** — Listen to pronunciations with AI-generated voices.
- **🗣️ Language Variety** — Detects and labels the specific variant (Sundanese, Betawi, Gen-Z, Japanese, etc.).

## Built For

**JuaraVibeCoding 2026** — A Google-powered competition celebrating Indonesian developer creativity.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Motion, Tailwind CSS, Vite |
| **Backend** | Express, TypeScript, Zod |
| **AI** | Google Gemini API (`@google/genai`) |
| **Cache** | LRU Cache with disk persistence |
| **Build** | esbuild (backend), Vite (frontend) |
| **Test** | Vitest, jsdom, Testing Library |

## Quick Start

```sh
# Install
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run dev (hot-reload backend + Vite frontend)
npm run dev

# Build for production
npm run build

# Run production
npm run start
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | tsx server.ts (hot-reload backend + Vite frontend) |
| `npm run build` | vite build && esbuild server.ts -> dist/ |
| `npm run start` | node dist/server.cjs (production) |
| `npm test` | vitest run (46 tests) |
| `npm run lint` | tsc --noEmit |
| `docker compose up` | Build + run with .env |

## API

### POST /api/transform
Auto-detects input language and returns Indonesian + English translations.

```json
{
  "text": "Arigatou",
  "lang": "id"
}
```

Response includes `translations` (formal_indonesian, daily_indonesian, professional_english), `vocabulary_breakdown`, `analysis`, and `learning_insight`.

---

<p align="center">
  <sub>Built with ❤️ and Google Gemini for JuaraVibeCoding 2026</sub>
</p>
