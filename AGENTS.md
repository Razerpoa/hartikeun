# Hartikeun — Agent Guide

## Project
Express + React SPA for Indonesian/Sundanese dialect translation via Google Gemini.

## Quick commands
```sh
npm run dev       # tsx server.ts (hot-reload backend + Vite frontend)
npm run build     # vite build && esbuild server.ts -> dist/
npm run start     # node dist/server.cjs (prod)
npm test          # vitest run (node env, backend only)
npm run lint      # tsc --noEmit
docker compose up # build + run with .env
```

## Architecture

```
server.ts                 # entry: load dict/cache, start server
src/
├── i18n.ts               # Shared typed translations & useI18n hook
├── vitest.setup.tsx      # Test setup & mocks
├── backend/
│   ├── config.ts         # env config (dotenv loads .env at module eval time)
│   ├── app.ts            # Express app factory (CORS, rate-limit, routes, Vite)
│   ├── utils.ts          # normalizeSlang(), getCacheKey()
│   ├── logger.ts         # [timestamp] LEVEL: [requestId] message
│   ├── validation.ts     # Zod schemas for API routes
│   ├── services/
│   │   ├── gemini.ts     # GoogleGenAI singleton (created at import time)
│   │   └── cache.ts      # LRU cache (max 1000, TTL 24h), persists every 5min
│   ├── middleware/
│   │   ├── errorHandler.ts # AppError class + { error: string } response shape
│   │   └── requestId.ts    # Generates 8-char request IDs
│   └── routes/
│       ├── transform.ts    # POST /api/transform
│       ├── wordDetails.ts  # POST /api/word-details
│       └── tts.ts          # POST /api/tts
└── components/             # React: LandingPage, Translator, WordDetails
    └── ui/                 # Extracted UI components (WordToken, CopyButton, etc.)
```

## Critical quirks

### ESM import order matters
`config.ts` calls `dotenv.config()` at module top level. This runs when the file is first imported — before `server.ts` code executes. The `.env` file must exist in the project root.

### Backend must NOT use `@/` alias
The `@/*` path alias in `tsconfig.json` is Vite-only (resolved by Vite for the frontend). Backend code (`src/backend/`) uses **relative imports with `.js` extensions**:
```ts
import { config } from '../config.js';   // correct
import { config } from '@/backend/config'; // BROKEN at runtime
```

### `esbuild` bundles `server.ts` for production
Build: `vite build` (frontend) + `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`. The `--packages=external` means `node_modules` must be present at runtime (Docker installs `npm ci --production` in the runtime stage).

### API contract
All error responses use `{ error: string }`. Frontend reads `errorData.error` at `Translator.tsx:322`. Do not change this shape.

Three Gemini routes sit behind `express-rate-limit` at 30 req/min per IP:
- `POST /api/transform` — text + optional base64 image, max 5000 chars, max 5MB image
- `POST /api/word-details` — word + optional context
- `POST /api/tts` — text, voice from whitelist: `Kore`, `Leda`, `Aoede`, `Puck`, `Charon`, `Fenrir`, `Arctos`

### Caching
- LRU cache: max 1000 entries, TTL 24h. Async persist to `word_cache.json` every 5 min + on graceful shutdown.
- Cache key: `{prefix}:{lang}[:{extra}]:{canonicalized text}` where `eu`→`e` for words > 3 chars.
- Image requests are never cached (cache key is `null`).
- `custom_dictionary.json` is loaded once at startup (not per-request).

### Testing
- Vitest, `jsdom` environment, test files: `src/**/*.test.{ts,tsx}`
- `@google/genai` is mocked via `vi.mock('@google/genai')` — no real API key needed
- 39 tests total (16 unit + 13 integration + 10 frontend/validation)

### Docker
Multi-stage: build with `npm ci` + `npm run build`, runtime with `npm ci --production` + copied `dist/`. HEALTHCHECK uses `wget http://127.0.0.1:3000/api/health` (explicit IPv4 — Alpine's BusyBox wget resolves `localhost` to IPv6). The word cache volume is mounted at `/data`.
