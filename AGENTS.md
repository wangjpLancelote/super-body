# AGENTS.md

Guidance for agentic coding in this repo. Keep changes scoped, auditable, and aligned
with repository boundaries and security rules.

## Overview

- Stack: Next.js (web), Expo/React Native (mobile), Supabase (DB/Auth/Functions), LangChain (AI).
- Architecture is strict: infra, backend, frontend, and AI layers are separated by directory.
- AI tools are allowed, but write operations must default to dry-run and require human approval.

## Non-Negotiable Rules

- Never bypass Supabase RLS. All DB access must honor user context.
- All Edge Functions must verify JWT via `supabase/functions/_shared/auth.ts`.
- Never use service role in client-facing code.
- Default all AI write actions to dry-run; require explicit confirmation to execute.
- Do not create files outside allowed directories (see repo structure below).
- Never hardcode secrets; use env vars and the provided sync scripts.

## Repository Boundaries (Must Follow)

- `apps/web/`: Next.js web app (frontend only).
- `apps/mobile/`: Expo mobile app (frontend only).
- `supabase/functions/`: Edge Functions (backend API/BFF only).
- `supabase/migrations/`: SQL migrations only.
- `ai/`: LangChain/LLM logic only (no direct DB writes).
- `ui/`: non-code design artifacts only.

If you do not know where code belongs, do not write it.

## Authoritative Docs

- `README.md`: entry point and quick start.
- `repo_structure.md`: directory boundaries and constraints.
- `plan.md`: architecture, security model, system scope.
- `tasks.md` / `tasks.yaml`: task definitions and dependencies.
- `supabase.config.md`: Supabase notes and CLI pointers.
- `SKILL-SPEC.md`: default template for writing skills.

## Build / Lint / Test Commands

Root workspace (workspaces: `apps/mobile`, `ai`):
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test`

Web (`apps/web`):
- Install: `cd apps/web && npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Tests: no test script defined

Mobile (`apps/mobile`):
- Dev: `npm run start`
- Run iOS: `npm run ios`
- Run Android: `npm run android`
- Run web: `npm run web`
- Lint: `npm run lint`
- Test: `npm test`
- Single test: `npm test -- <pattern>` (Jest pattern or file path)
- Build: `npm run build:android`, `npm run build:ios`

AI (`ai`):
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Test: `npm test`
- Single test: `npx vitest run path/to/file.test.ts`

Supabase (Edge Functions / DB):
- Local services: `supabase start`
- New function: `supabase functions new <name>`
- Deploy: `supabase functions deploy`

## Environment + Secrets

Root `.env` is the single source of truth. Generate module env files via:
- `bash scripts/sync-env.sh`
- `bash scripts/sync-supabase-secrets.sh [project_ref]`

## Code Style Guidelines

Language and types:
- TypeScript everywhere; strict mode is enabled in all apps.
- Prefer type-only imports (`import type { ... }`) for types.
- Avoid `any`; use explicit types or `unknown` with validation.

Imports:
- Order: external -> internal aliases -> relative.
- Use path aliases when available:
  - Web: `@/*` maps to `apps/web/src/*`.
  - Mobile: `@/*` maps to `apps/mobile/src/*`.
  - AI: `@/*` maps to `ai/src/*` (code currently lives at `ai/`).

Formatting:
- Follow existing file style (the repo mixes semicolon and no-semicolon files).
- Use the repo lint/format scripts when present.
- Keep indentation at 2 spaces; keep lines readable, avoid overly long lines.

Naming:
- Components and types: `PascalCase`.
- Variables, functions, hooks: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities.

React (web + mobile):
- Prefer function components and hooks.
- Keep hooks at the top level; avoid conditional hooks.
- Keep side effects in `useEffect` and memoize callbacks with `useCallback` when reused.

Error handling:
- Check `res.ok` for fetches; throw or return typed error objects.
- Log errors with context; avoid swallowing errors silently.
- Edge Functions should throw explicit errors with actionable messages.

Supabase usage:
- Use `supabase.functions.invoke` from clients for Edge Functions.
- In functions, use `_shared/auth.ts` and respect RLS.
- Never use service role in client code.

AI-specific:
- Tools default to dry-run, with explicit confirmation required for execution.
- Use `ai/prompts/system.md` to control agent behavior.

## Cursor / Copilot Rules

- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions found in `.github/copilot-instructions.md`.
