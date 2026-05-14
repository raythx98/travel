# Gotchas

## Vite base path must match the GitHub Pages repo path

`vite.config.ts` sets `base: '/travel/'`. If the GitHub repo is renamed or the Pages URL changes, this value must be updated and a new build deployed. Forgetting this causes all assets to 404.

## `useStream` resets state on every sessionId change

When `sessionId` changes, `useStream` clears `tokens`, `tools`, and `question` before opening a new connection. This is intentional — navigating from one session to another must not show stale output.

## `refetch` in `useSession` uses `useCallback`

The `refetch` function from `useSession` is wrapped in `useCallback` so its reference is stable across renders. This allows it to be used safely in `useEffect` dependency arrays (e.g., in `SessionStream`) without causing infinite re-fetch loops.

## Auth token location must not change

`src/lib/auth.ts` stores the token at `localStorage['travel_auth_token']`. If this key is ever changed, logged-in users will be silently logged out on next load. All reads/writes must go through `auth.ts`.

## CSS Module class names in globals.css

Utility classes like `.btn`, `.badge-*`, `.dot-*`, `.spinner`, `.error`, `.output` are in the global stylesheet and applied via plain string class names in JSX (e.g., `className="btn btn-primary"`). They are NOT CSS Module classes, so they must not be imported as a module object.

## Leaflet CSS must be scoped (Phase 3)

Do not import Leaflet's CSS globally. Import it as a side-effect only inside the `TravelMap` component to avoid polluting the global stylesheet with Leaflet's resets.
