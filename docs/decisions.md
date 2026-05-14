# Decisions

## ADR-001: HashRouter over BrowserRouter

**Decision:** Use `HashRouter` from react-router-dom.

**Reason:** GitHub Pages serves a static bundle with no server-side routing. `BrowserRouter` requires a catch-all redirect (e.g., a `404.html` trick) that is fragile across GH Pages deployments. `HashRouter` works correctly with zero server config.

**Trade-off:** URLs contain `#` (e.g., `https://user.github.io/travel/#/sessions/123`), which is less clean. Acceptable for this project.

## ADR-002: No Vercel AI SDK

**Decision:** Custom `useStream` hook in `src/lib/sse.ts` instead of the Vercel AI SDK.

**Reason:** The backend emits standard SSE with custom event types (`tool`, `question`, `done`, `error`) that do not map to the AI SDK's data stream protocol. Forcing the SDK in would require a shim on the backend and obscure the event parsing. A purpose-built hook is simpler and fully typed.

**Trade-off:** We own the SSE parsing code. If the backend switches to the AI SDK data format in the future, we can swap in `useChat` at that point.

## ADR-003: fetch + ReadableStream over EventSource

**Decision:** `fetch` with `AbortController` for SSE, not `EventSource`.

**Reason:** `EventSource` does not support custom request headers, so we cannot attach the `Authorization` header for authenticated streams. `fetch` supports both streaming and auth headers.

**Trade-off:** We manually split on `\n\n` and parse `data:` lines. This is a small amount of code and is fully covered by the types in `types.ts`.

## ADR-004: Phase 3 itinerary types deferred

**Decision:** Itinerary-related types (`Day`, `Stop`, `ItineraryItem` subtypes) are not defined yet.

**Reason:** The exact shape of the Go backend's itinerary response is unknown. Defining types now would require assumptions that may need to be reversed. Phase 3 implementation will be driven by the actual API contract.
