# Architecture

## Overview

Static SPA deployed to GitHub Pages. All intelligence lives in the Go backend; the frontend is a thin shell that submits goals, streams responses, and renders results.

```
GitHub Pages (static SPA)
  React 19 + Vite + TypeScript
  CSS Modules + shared globals.css
          │
          │ HTTPS + SSE (fetch-based ReadableStream)
          ▼
  Go API Server (net/http)
    Caddy TLS termination
```

## Routing

`HashRouter` (react-router-dom v6). Hash-based routing requires no server config and works out of the box on GitHub Pages.

| Route            | Component                                   |
| ---------------- | ------------------------------------------- |
| `#/`             | `GoalInput` — submit a new planning goal    |
| `#/sessions`     | `SessionList` — list all sessions           |
| `#/sessions/:id` | `SessionStream` — stream output + itinerary |

## Auth Flow (stub — Phase 4)

`src/lib/auth.ts` reads/writes a JWT from `localStorage` under the key `travel_auth_token`. Every `api.ts` request attaches it as `Authorization: Bearer <token>`. On 401 the token is cleared. Phase 4 will add a login/register page that calls a `/auth` endpoint.

## SSE Data Flow

1. `GoalInput` POSTs to `/sessions` → receives `{ id }`.
2. Browser navigates to `#/sessions/:id`.
3. `SessionStream` mounts → `useStream(id)` opens a `fetch` to `/sessions/:id/stream`.
4. The response body is read as a `ReadableStream`, split on `\n\n`, and each `data: {...}` line is parsed into a `StreamEvent`.
5. State is accumulated: `tokens[]` (joined for display), `tools[]` (upserted by name), `question` (latest pending question).
6. On `{ type: 'done' }` or stream close, `useSession.refetch()` pulls the final session metadata.
