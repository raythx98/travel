# Modules

## `src/lib/types.ts`

All shared TypeScript interfaces and type aliases. Import from here for anything used across more than one file.

Key exports: `Session`, `StreamEvent`, `ToolEvent`, `QuestionEvent`, `StreamStatus`, `ToolStatus`, request/response shapes.

## `src/lib/api.ts`

Thin fetch wrapper. All HTTP calls go through `request<T>()`, which injects the auth header, handles 401/429 centrally, and throws `ApiError` on non-OK responses. Callers never call `fetch` directly.

Public functions: `createSession`, `listSessions`, `getSession`, `respondToQuestion`, `interruptSession`.

## `src/lib/sse.ts`

`useStream(sessionId)` — opens a fetch-based streaming connection to `/sessions/:id/stream` and parses SSE events into typed React state. Returns `{ tokens, tools, question, status, clearQuestion }`. Cleans up via `AbortController` on unmount.

## `src/lib/auth.ts`

Token storage: `getToken`, `setToken`, `clearToken`. Storage location is `localStorage['travel_auth_token']`. All auth reads go through this module — never read localStorage directly elsewhere.

## `src/hooks/useSession.ts`

`useSession(id)` — fetches a single session by ID. Exposes a stable `refetch` callback (via `useCallback`) for use in effect deps without infinite loops.

## `src/components/ToolStatusBar`

Renders a row of pill badges, one per tool event, coloured by status (running/done/error). Returns null when the tools array is empty.

## `src/components/AgentQuestion`

Displays an agent question and an inline answer form. Calls `respondToQuestion` on submit; calls `onAnswered()` on success so the parent can clear the pending question.

## `src/pages/GoalInput`

Entry page. Single textarea + submit button. POSTs to `/sessions` and navigates to the stream page on success.

## `src/pages/SessionList`

Fetches and lists all sessions. Each row links to `/sessions/:id`. Shows a status badge and creation date per session.

## `src/pages/SessionStream`

Primary stream view. Composes `useStream` + `useSession` + `ToolStatusBar` + `AgentQuestion`. Auto-scrolls the output pane. Exposes a "Stop agent" button while streaming and a "Plan another trip" CTA when done.
