# Plan: Phase 2 + Phase 3 Travel Planner Frontend

**Created:** 2026-05-14T14:42:11  
**Author:** Claude Code

---

## Inputs

- Blank repo with AGENTS.md, GUIDE.md, CLAUDE.md, README.md, .gitignore
- Backend: Go API server at `VITE_API_URL` (expected at `http://localhost:8080` in dev)
- Deployment target: GitHub Pages (static SPA)

## Constraints

- No paid APIs (Leaflet + OSM only)
- No SSR — pure SPA, `vite build` output deployed to GH Pages
- Minimal dependencies — each justified below
- No direct booking; deep-link rendering only
- `@/` path aliases throughout — no relative imports from route files

## Success Criteria

- User can submit a travel goal → stream tokens/tools/questions → see final itinerary
- Session list page shows past sessions with links
- Map renders day-by-day stop markers + polylines
- Itinerary cards render for all four item types (flight, hotel, activity, restaurant)
- Reservation confirmation modal (cancel policy + confirm button)
- Cancellation deadline badge
- `npm run check` and `npm run lint` pass with zero errors

---

## Dependencies

| Package                                        | Justification                                            |
| ---------------------------------------------- | -------------------------------------------------------- |
| `react` + `react-dom`                          | Core framework                                           |
| `react-router-dom`                             | SPA routing — unavoidable for multi-page app on GH Pages |
| `vite` + `@vitejs/plugin-react`                | Build tool                                               |
| `typescript`                                   | Type safety                                              |
| `react-leaflet` + `leaflet` + `@types/leaflet` | Map rendering (Phase 3)                                  |
| `eslint` + plugins                             | Linting                                                  |
| `prettier`                                     | Formatting                                               |

**Intentionally excluded:** `ai` (Vercel AI SDK) — the backend uses standard SSE with custom event types that don't map to the AI SDK protocol. A custom `useStream` hook in `src/lib/sse.ts` is simpler, correct, and avoids an unnecessary dependency. GUIDE.md permits a custom hook as the alternative.

---

## Technical Approach

### Routing

`HashRouter` (react-router-dom v6) — hash-based routing works on GitHub Pages without 404 redirects or server config. Routes:

- `/` → GoalInput
- `/sessions` → SessionList
- `/sessions/:id` → SessionStream

### SSE Streaming

Custom `useStream` hook in `src/lib/sse.ts`:

- Uses native `fetch` + `ReadableStream` (no EventSource — fetch allows auth headers)
- Parses `data: {...}\n\n` lines into typed `StreamEvent` objects
- Exposes `{ tokens, tools, question, status }` — components bind directly
- Handles `401` / `429` at this layer, not in components

### Auth Stub

`src/lib/auth.ts` provides `getToken()` / `setToken()` / `clearToken()` using `localStorage`. Phase 4 will wire up real JWT; for now the token is empty and the backend is expected to be open or use a static dev token.

### State Management

- `useState` / `useReducer` for all local state
- No Context needed yet (auth state is read via `auth.ts` directly, session list is fetched per-page)

### Map (Phase 3)

- `react-leaflet` wrapping Leaflet
- Leaflet CSS scoped to `TravelMap.tsx` via a side-effect import (not global)
- Markers for each stop, `Polyline` connecting stops in day order
- Different marker colour per day index

### Itinerary Cards (Phase 3)

Discriminated union on `ItineraryItem.type`:

- `FlightCard` — airline, flight number, departure/arrival, deep link
- `HotelCard` — name, check-in/out, deep link, `CancellationBadge`
- `ActivityCard` — name, time, description, deep link, `CancellationBadge`
- `RestaurantCard` — name, time, cuisine, deep link

### Reservation Modal (Phase 3)

`ReservationModal` receives `item` + `onClose` + `onSuccess`. Escape key handled via `useEffect` on `document`. Displays cancel policy and a confirm deep-link button.

---

## File Plan

### New Config / Root Files

```
package.json
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
index.html
eslint.config.js
.prettierrc
.env.example
.github/workflows/deploy.yml
```

### New Source Files

```
src/vite-env.d.ts
src/main.tsx
src/App.tsx
src/styles/globals.css

src/lib/types.ts
src/lib/api.ts
src/lib/sse.ts
src/lib/auth.ts

src/pages/GoalInput.tsx
src/pages/GoalInput.module.css
src/pages/SessionStream.tsx
src/pages/SessionStream.module.css
src/pages/SessionList.tsx
src/pages/SessionList.module.css

src/components/ToolStatusBar/ToolStatusBar.tsx
src/components/ToolStatusBar/ToolStatusBar.module.css
src/components/AgentQuestion/AgentQuestion.tsx
src/components/AgentQuestion/AgentQuestion.module.css

src/components/Map/TravelMap.tsx
src/components/Map/TravelMap.module.css
src/components/ItineraryCard/ItineraryCard.tsx
src/components/ItineraryCard/ItineraryCard.module.css
src/components/ItineraryCard/FlightCard.tsx
src/components/ItineraryCard/HotelCard.tsx
src/components/ItineraryCard/ActivityCard.tsx
src/components/ItineraryCard/RestaurantCard.tsx
src/components/ReservationModal/ReservationModal.tsx
src/components/ReservationModal/ReservationModal.module.css
src/components/CancellationBadge/CancellationBadge.tsx
src/components/CancellationBadge/CancellationBadge.module.css
```

### Files to Change

```
README.md   (brief project description update)
```

### Docs to Update

```
docs/architecture.md   (routing, auth flow, SSE data flow)
docs/modules.md        (per-module summaries)
docs/decisions.md      (ADRs: HashRouter choice, no Vercel AI SDK, etc.)
docs/gotchas.md        (Leaflet CSS scoping, GH Pages base path, etc.)
```

---

## Implementation Phases

### Phase A — Scaffold & Config

1. Write `package.json` with all dependencies
2. Write TypeScript config files
3. Write `vite.config.ts` (base path, path aliases)
4. Write `index.html`
5. Write ESLint + Prettier config
6. Write `.env.example`

### Phase B — Core Library

7. `src/lib/types.ts` — all shared interfaces
8. `src/lib/auth.ts` — token stub
9. `src/lib/api.ts` — fetch wrapper
10. `src/lib/sse.ts` — `useStream` hook
11. `src/styles/globals.css` — utility classes

### Phase C — App Shell

12. `src/vite-env.d.ts`
13. `src/main.tsx`
14. `src/App.tsx` (HashRouter + routes)

### Phase D — Pages (Phase 2)

15. `GoalInput` page
16. `SessionList` page
17. `SessionStream` page + `ToolStatusBar` + `AgentQuestion` components

### Phase E — Map & Itinerary (Phase 3)

18. `TravelMap` component
19. `CancellationBadge` component
20. Four itinerary card components
21. `ItineraryCard` dispatcher
22. `ReservationModal` component
23. Wire map + cards into `SessionStream` page

### Phase F — Deploy & Docs

24. GitHub Actions workflow
25. `docs/` files

### Phase G — QA

26. `npm install`
27. `npm run check`
28. `npm run lint`
29. Fix any errors

---

## Assumptions

1. The Go backend's `/sessions/{id}` response includes an `itinerary` field with `days`, each day containing `stops` (lat/lng) and `items` (typed itinerary items).
2. `stops` include `lat`, `lng`, and `name` fields.
3. Itinerary items include a `deep_link` field and for bookable items a `cancel_policy` and `cancel_deadline` field.
4. The backend accepts requests without an auth token for now (Phase 4 will add JWT).
5. React Router v6 is approved as a dependency (unavoidable for SPA routing).

## Future Work (out of scope)

- JWT login / register flow (Phase 4)
- Collaborative share links (Phase 4)
- Session resume / soft interrupt (Phase 4)
- `react-query` / SWR for server state caching
- Dark mode
- Mobile-responsive breakpoints beyond basic fluid layout
