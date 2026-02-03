# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is a multi-phase AI-ready cloud application built with React Native (Expo), Supabase, and LangChain. The architecture strictly enforces separation of concerns across infrastructure, backend, frontend, and AI layers. **AI agents must follow the directory structure and task boundaries defined in `repo_structure.md`, `agents.yaml`, and `tasks.yaml`.**

## Key Principles

- **Secure by Design**: All data access must respect Supabase Row Level Security (RLS)
- **AI as Plugin**: AI capabilities are pluggable modules that never compromise core business logic
- **Least Privilege**: Each component (AI, Edge Function, Client) operates with minimal required permissions
- **Auditable**: All AI operations and data mutations must be traceable
- **No Autonomous Writes**: AI write operations default to dry-run mode until human approval

## Repository Structure

The codebase is strictly organized by function. **AI agents must not create files outside designated areas:**

```
root/
├─ supabase/
│  ├─ functions/              # Backend API (Edge Functions / Deno)
│  │  ├─ _shared/            # Shared auth/context middleware (required by all functions)
│  │  ├─ todos/              # Todo CRUD endpoints
│  │  ├─ files/              # File upload endpoints
│  │  └─ ai-assistant/       # AI endpoint (requires auth.ts)
│  └─ migrations/            # SQL schemas and RLS policies
├─ apps/mobile/              # React Native / Expo frontend
│  └─ src/
│     ├─ auth/               # Login/logout and auth state
│     ├─ todos/              # Todo UI components
│     └─ files/              # File upload/preview UI
└─ ai/                       # LangChain / AI logic
   ├─ runtime.md             # Runtime environment documentation
   ├─ vector.ts              # Supabase pgvector integration
   ├─ tools.ts               # LangChain tool definitions
   ├─ agent.ts               # Agent logic
   └─ prompts/               # System prompts and instructions
```

## Authoritative Documents

Use these as the single source of truth (avoid duplicating content elsewhere):

- `README.md` (entry point + quick start)
- `repo_structure.md` (directory boundaries and constraints)
- `plan.md` (architecture, security model, system scope)
- `tasks.yaml` (task definitions and dependencies)
- `tasks.md` (human-readable task breakdown)
- `supabase.config.md` (non-secret Supabase notes + CLI pointers)

## Development Commands

This repo includes a root `package.json` (workspaces) plus module-specific `package.json` files (e.g. `apps/web`).

**Supabase Edge Functions** (Deno):
- Initialize: `supabase functions new <function-name>`
- Run locally: `supabase start` (requires Supabase CLI)
- Deploy: `supabase functions deploy`

**React Native Frontend**:
- Initialize: `npx create-expo-app apps/mobile`
- Run: `cd apps/mobile && expo start`
- Build APK: `eas build --platform android`

**LangChain / AI**:
- Runtime: Node.js
- Package management: npm

**Database**:
- Migrations are SQL files in `supabase/migrations/`
- Apply via Supabase CLI or direct execution

## Ops Scripts (Environment & Secrets)

These scripts live in `scripts/` and are the supported way to keep env values consistent.

- `bash scripts/sync-env.sh`
  - Reads root `.env` and generates module env files:
    - `apps/web/.env.local`
    - `apps/mobile/.env`
    - `ai/.env.local`
    - `supabase/functions/.env`
- `bash scripts/sync-supabase-secrets.sh [project_ref]`
  - Reads root `.env` and pushes secrets to **Supabase Edge Functions** via CLI.
  - You can also set `SUPABASE_PROJECT_REF` in your shell instead of passing an arg.

## Environment Layout (Single Source + Module Mapping)

Root `.env` is the single source of truth. Module env files are generated via
`bash scripts/sync-env.sh`. The mappings below match `.env.example`.

### Shared Keys (root `.env`)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_EDGE_URL` (optional)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `STOCK_API_BASE_URL`, `STOCK_API_KEY`
- `AI_ASSISTANT_DRY_RUN`, `AI_ASSISTANT_MODEL`,
  `AI_ASSISTANT_MAX_TOKENS`, `AI_ASSISTANT_TEMPERATURE`
- `NODE_ENV`

### Module: Web (`apps/web/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` ← `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_EDGE_URL` ← `SUPABASE_EDGE_URL`
- `NEXT_PUBLIC_STOCK_API_BASE_URL` ← `STOCK_API_BASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ← `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `OPENAI_ORG_ID`, `ANTHROPIC_API_KEY`
- `AI_ASSISTANT_DRY_RUN`, `AI_ASSISTANT_MODEL`,
  `AI_ASSISTANT_MAX_TOKENS`, `AI_ASSISTANT_TEMPERATURE`
- `STOCK_API_KEY`

### Module: Mobile (`apps/mobile/.env`)

- `EXPO_PUBLIC_SUPABASE_URL` ← `SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` ← `SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_EDGE_URL` ← `SUPABASE_EDGE_URL`

### Module: AI (`ai/.env.local`)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `STOCK_API_KEY`, `STOCK_API_BASE_URL`

### Module: Edge Functions (`supabase/functions/.env`)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `AI_ASSISTANT_DRY_RUN`, `AI_ASSISTANT_MODEL`,
  `AI_ASSISTANT_MAX_TOKENS`, `AI_ASSISTANT_TEMPERATURE`
- `STOCK_API_KEY`, `STOCK_API_BASE_URL`

## Critical Rules for AI Agents

### 1. Never Bypass RLS
- All database operations must go through Supabase Client with RLS enabled
- AI always operates with `user_id` context injected via Edge Functions
- Never use Service Role directly in client-facing code

### 2. Auth is Mandatory
- All API endpoints must verify JWT tokens via `supabase/functions/_shared/auth.ts`
- Client-side code must use Supabase Auth for login/logout
- AI endpoints enforce role-based permissions (user | premium | admin)

### 3. Write Operations Are Constrained
- AI tools that mutate data (createTodo, etc.) must default to dry-run
- Dry-run output must show what _would_ happen without executing
- Only after human review should actual writes occur

### 4. File Placement
- Backend code goes in `supabase/functions/` only
- Frontend code goes in `apps/mobile/src/` only
- AI/LangChain code goes in `ai/` only
- SQL migrations go in `supabase/migrations/` only
- **Violating this will break the project architecture**

### 5. Secrets Management
- Never hardcode API keys, database credentials, or LLM keys
- Use Supabase environment variables for secrets
- For local development, `.env.local` or Supabase CLI configurations
- Secrets should be passed via environment at runtime, not in code

## References

- Architecture, data models, and security model: `plan.md`
- Detailed tasks and outputs: `tasks.md` / `tasks.yaml`
