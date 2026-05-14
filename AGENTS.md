# AGENTS.md

Agents operating in this repository **must follow the rules in this file**. Violations will cause runs to be blocked or reverted.

# Rule Priority

When rules conflict, follow this order:

1. Correctness & safety
2. Maintainability
3. Readability
4. Consistency with existing codebase
5. Style preferences in this document

# Style Guidelines

- Strictly follow existing code style in the codebase.
- Use React functional components and hooks throughout — no class components.
- Use TypeScript strict mode throughout — no `any` types.
- Write JSDoc comments for exported utility functions and types.
- Keep code concise and elegant — don't over-engineer.
- Adhere to SOLID principles, especially Single Responsibility.
- Always import from `@/` path aliases, not relative paths from route files.

## Component Conventions

- PascalCase file names for React components (e.g., `ItineraryCard.tsx`).
- camelCase for utility modules (e.g., `api.ts`, `auth.ts`, `sse.ts`).
- Co-locate component-specific types at the top of the component file; shared types go in `src/lib/types.ts`.
- Use scoped CSS Modules for component-specific styles — no inline styles.
- Use shared utility classes from `src/styles/globals.css` — don't reinvent them.
- Handle `Escape` key in modals via a `useEffect` that listens on `document`.
- Modals receive `onClose` and `onSuccess` callbacks — always call them appropriately.
- Prefix custom hooks with `use` (e.g., `useSession`, `useStream`).

## TypeScript & Data Handling

- Prefer typed interfaces over `Record<string, any>`.
- All API responses must be typed — define interfaces in `src/lib/types.ts`.
- Avoid silent failure patterns — always surface errors to the user.
- Never discard a thrown error without handling it.
- Use typed error objects for form validation, not untyped state.
- Prefer explicit return types on exported functions.

## API & Streaming Conventions

- Use the `api` wrapper in `src/lib/api.ts` for all HTTP calls — never call `fetch` directly in components.
- Use the Vercel AI SDK `useChat` / `useCompletion` hooks or a custom `useStream` hook for SSE — never roll bespoke EventSource logic in components.
- Type all request payloads and response shapes in `src/lib/types.ts`.
- Handle `401` and `429` responses explicitly at the API layer, not in individual components.
- Never embed the API base URL as a string literal — read it from `import.meta.env.VITE_API_URL`.

## Documentation

The `docs/` directory holds living reference documents. Update them incrementally as you explore, plan, and implement.

| File                   | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `docs/architecture.md` | High-level system design — routing, auth flow, SSE data flow        |
| `docs/modules.md`      | Per-module summaries — what each file owns and its public interface |
| `docs/decisions.md`    | ADRs — why things are the way they are                              |
| `docs/gotchas.md`      | Traps, quirks, things not to change without care                    |

- Append new findings; do not overwrite existing content without good reason.
- Keep entries short and factual — a few sentences per item is enough.

# Security

- Never hard-code secrets, tokens, or API base URLs in component files — use `import.meta.env`.
- Auth tokens must stay in the storage location established by `src/lib/auth.ts` — do not move them.
- Do not store user credentials in component state.
- Apply the least-privilege principle: don't broaden data access beyond what the task requires.
- Treat all content received via SSE as untrusted — sanitise before injecting into the DOM.

# Decision Framework

When multiple approaches are possible:

1. Prefer the simplest solution that satisfies requirements
2. Prefer `useState` / `useReducer` for local state; reach for Context only when prop-drilling spans 3+ levels
3. Prefer explicit TypeScript types over inference for function signatures
4. Avoid premature abstraction
5. Prefer existing shared styles (`globals.css`) over new CSS Modules entries

# Planning Rules

Before starting a **non-trivial task**, create a plan at:

```
agent_logs/YYYYMMDD_HHMMSS_<descriptive_name>_plan.md
```

- Each plan must be standalone: define inputs, constraints, and success criteria.
- Plans must be executable without prior context.
- Must list `files_to_change` and `new_files`.
- Must describe a concise, coherent technical approach.
- Planning output must not modify repository code.

## Confirmation Gate

After the plan file is written, **stop and do the following before any implementation**:

1. Present a concise summary of the plan to the user.
2. Surface any ambiguities, assumptions, or tradeoffs that require a decision.
3. Ask the user to confirm they are happy with the plan.
4. **Do not begin implementation until explicit confirmation is received.**

If the user requests changes, update the plan file and repeat the confirmation step.

## Scope Control

- Do not expand scope beyond explicit requirements.
- If improvements are identified, list them under "future work" only.

# Implementation Rules

- Implement complete features end-to-end; no partial implementations should remain.
- Never stop midway through a defined phase.
- Preserve existing inline comments; do not remove useful historical context.
- Other agents/humans may modify the repository concurrently — never undo unrelated changes.
- Do NOT commit or push without explicit approval.

# Formatting

Run at the end of full implementation:

```bash
npm run format
npm run lint
```

# Type Checking

```bash
npm run check
```

- Fix all type errors before proceeding.
- Never bypass `tsc` failures.

# Testing Rules

Verify changes manually in the browser:

```bash
npm run dev
```

- Ensure the backend is running at `http://localhost:8080`.
- Test the golden path and relevant edge cases after any change.

# Definition of Done

A task is complete when:

- Plan is fully executed
- No partial implementations remain
- Type check passes: `npm run check`
- Lint passes: `npm run lint`
- `docs/` updated wherever relevant
- Changes are consistent with repository standards

# Suggesting Future Work

When you identify improvements beyond the current task's scope:

- Document them clearly in the relevant log or doc file.
- DO NOT implement unless explicitly instructed.

# Environment Instructions

## Setup

```bash
npm install
npm run dev    # starts dev server at http://localhost:5173
```

The frontend expects the Go backend at `http://localhost:8080` (dev) — see `src/lib/api.ts` for the base URL logic.

## Key Commands

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start development server            |
| `npm run build`   | Production build to `dist/`         |
| `npm run check`   | Type-check all TS/TSX files         |
| `npm run lint`    | Run ESLint                          |
| `npm run format`  | Auto-format all files with Prettier |
| `npm run preview` | Preview production build locally    |

## Dependency Inspection

- Check `package.json` for declared versions.
- Before implementing new functionality, check if `src/lib/` already covers the need.
- Do not install new dependencies without explicit approval — keep the bundle small.
- For the internal utility `src/lib/api.ts`, always check its current interface before adding new wrappers.
