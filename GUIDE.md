# Travel Planner Frontend — Engineering Guide

## Quick Reference

| Item             | Decision                                          |
| ---------------- | ------------------------------------------------- |
| Language         | TypeScript                                        |
| Framework        | React 19 + Vite                                   |
| Styling          | CSS Modules + shared `globals.css`                |
| Maps             | Leaflet + OSM tiles (no API key)                  |
| SSE streaming    | Vercel AI SDK (`useChat` / custom `useStream`)    |
| State management | React hooks (`useState`, `useReducer`, Context)   |
| Hosting          | GitHub Pages (static SPA — no SSR, no API routes) |
| Backend          | Go API server at `VITE_API_URL`                   |
| Phase 0–1        | Plain `index.html` + vanilla JS — no build step   |
| Phase 2+         | This React + Vite repo                            |

---

## Constraints

- **GitHub Pages is static only** — no server-side rendering, no API routes. The app is a pure SPA.
- **No paid APIs** — Leaflet uses free OSM tiles, no Mapbox, no Google Maps.
- **No SSR** — `vite build` output is deployed directly to GitHub Pages via GitHub Actions.
- **Minimal dependencies** — every new package must justify its existence. Default to stdlib React and Vite.
- **No direct booking** — the frontend produces and displays deep links from the backend; it does not process payments.

---

## Architecture

```
GitHub Pages (static SPA)
React + Vite
Leaflet + OSM tiles (map view)
Vercel AI SDK (SSE streaming)
        │
        │ HTTPS + SSE
        ▼
Go API Server (net/http)
  Caddy TLS termination
```

The frontend is a thin shell: it sends goals to the backend, streams the response token by token, and renders the resulting itinerary. All agent intelligence lives in the backend.

---

## API Contract

Base URL is read from `import.meta.env.VITE_API_URL`. In dev, set this to `http://localhost:8080`.

### Endpoints

| Method | Path                       | Purpose                                 |
| ------ | -------------------------- | --------------------------------------- |
| `POST` | `/sessions`                | Create a new planning session           |
| `GET`  | `/sessions/{id}/stream`    | SSE stream of agent output              |
| `POST` | `/sessions/{id}/interrupt` | Cancel a running agent                  |
| `POST` | `/sessions/{id}/respond`   | Inject user answer to an agent question |
| `GET`  | `/sessions`                | List sessions for the current user      |
| `GET`  | `/sessions/{id}`           | Fetch a completed session and itinerary |

### SSE event shape

```ts
// Each SSE event is one of:
type StreamEvent =
  | { type: 'token'; content: string } // partial LLM output
  | { type: 'tool'; name: string; status: 'running' | 'done' | 'error' }
  | { type: 'question'; id: string; text: string } // agent asking user
  | { type: 'done'; session_id: string }
  | { type: 'error'; message: string };
```

Never parse raw SSE strings in components — handle all parsing in `src/lib/sse.ts`.

---

## Directory Structure

```
src/
  components/       # Reusable UI components
  pages/            # Top-level route pages
  hooks/            # Custom React hooks (useStream, useSession, …)
  lib/
    api.ts          # fetch wrapper — all HTTP calls go through here
    sse.ts          # SSE parsing and useStream hook
    auth.ts         # token storage and auth helpers
    types.ts        # all shared TypeScript interfaces
  styles/
    globals.css     # shared utility classes
  main.tsx
  App.tsx
```

---

## State Management

Use the simplest tool that works:

| Scope                                         | Tool                                              |
| --------------------------------------------- | ------------------------------------------------- |
| Component-local UI state                      | `useState`                                        |
| Complex local state with multiple transitions | `useReducer`                                      |
| Cross-component (auth, session list)          | React Context                                     |
| Server state / cache                          | direct `fetch` + local state — no React Query yet |

Do not reach for a global state library (Zustand, Redux) unless prop-drilling becomes genuinely painful across 3+ levels.

---

## Streaming

The Vercel AI SDK handles SSE reconnection and parsing. Use its primitives where they fit. For custom event types (tool status, agent questions) that the SDK doesn't model, fall back to a custom `useStream` hook in `src/lib/sse.ts`.

Never put `EventSource` instantiation directly in a component.

---

## Map View (Phase 2+)

- Use `react-leaflet` wrapper around Leaflet.
- Tiles from OpenStreetMap — no API key, no billing.
- Markers represent itinerary stops; polylines connect them in day order.
- Do not import the full Leaflet CSS globally — scope it to the map component.

---

## Deployment

GitHub Actions on push to `main`:

```yaml
- run: npm ci
- run: npm run build
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

`vite.config.ts` must set `base` to the GitHub Pages repo path:

```ts
export default defineConfig({
  base: '/travel/', // matches github.com/<user>/travel
});
```

---

## Environment Variables

| Variable       | Purpose                                 |
| -------------- | --------------------------------------- |
| `VITE_API_URL` | Go backend base URL (no trailing slash) |

Set via `.env.local` for development. Set via GitHub Actions secrets + `env:` for production builds.

Never commit `.env.local`.

---

## Build Phases

### Phase 0–1 — Plain HTML/JS

No build step. No npm. Push `index.html` directly to GitHub Pages. See backend `GUIDE.md` for the reference implementation.

### Phase 2 — React + Vite (this repo)

Migrate from plain HTML when map view, itinerary cards, or reservation confirmation UI is needed.

- [ ] Vite project scaffold: `npm create vite@latest . -- --template react-ts`
- [ ] Configure `VITE_API_URL` env var
- [ ] `src/lib/api.ts` — fetch wrapper with auth header injection
- [ ] `src/lib/sse.ts` — SSE hook backed by Vercel AI SDK
- [ ] `src/lib/types.ts` — shared types for session, itinerary, stream events
- [ ] Goal input page → POST `/sessions` → redirect to session stream view
- [ ] Session stream view — renders tokens, tool status bar, agent question UI
- [ ] Session list page
- [ ] GitHub Actions deploy workflow

### Phase 3 — Map + Itinerary Cards

- [ ] `react-leaflet` map with day-by-day stop markers
- [ ] Itinerary card components (flight, hotel, activity, restaurant)
- [ ] Reservation confirmation modal (cancel policy, confirm button)
- [ ] Cancellation deadline badge

### Phase 4 — Auth + Collaboration

- [ ] JWT login / register flow (replaces auth stub)
- [ ] Collaborative session share link
- [ ] Session history with resume support
- [ ] Soft interrupt (inject context while agent runs)
- [ ] Hard interrupt (stop button)

---

## Key Dependencies

| Package                     | Purpose                   |
| --------------------------- | ------------------------- |
| `react` + `react-dom`       | UI framework              |
| `vite`                      | Build tool and dev server |
| `typescript`                | Type safety               |
| `ai` (Vercel AI SDK)        | SSE streaming primitives  |
| `react-leaflet` + `leaflet` | Map rendering (Phase 3+)  |

### Explicitly Excluded

| Package               | Reason                                         |
| --------------------- | ---------------------------------------------- |
| `react-query` / `swr` | Direct fetch + state is sufficient for Phase 2 |
| `redux` / `zustand`   | React Context covers current state needs       |
| Google Maps / Mapbox  | Leaflet + OSM is free and sufficient           |
| Any CSS framework     | Custom globals.css keeps the bundle lean       |
