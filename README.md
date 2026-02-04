# Super Body

AI-ready cloud application with Next.js (Web), React Native (Expo/Mobile), Supabase (DB/Auth/Storage/Functions), and LangChain (AI).

**Project Map**
- `apps/web` Next.js web app
- `apps/mobile` Expo mobile app
- `ai` LangChain integration layer
- `supabase` Edge Functions and database migrations
- `scripts` environment and ops helpers

**Quick Start (local dev)**
1. Prereqs: Node.js 18+, npm, Supabase CLI (for local DB/functions), Expo Go (for mobile).
2. Install root workspace deps:
```bash
npm install
```
3. Install web app deps:
```bash
cd apps/web && npm install
```
4. Configure env:
```bash
cp .env.example .env
bash scripts/sync-env.sh
```
5. Run services (separate terminals). Use `supabase start` only if you want local DB/functions:
```bash
cd apps/web && npm run dev
cd apps/mobile && npm run start
cd ai && npm run dev
supabase start
```

Next.js defaults to `http://localhost:3000` and will switch ports if 3000 is in use.

**Docs**
- `GETTING_STARTED.md` - full setup guide
- `SETUP.md` - environment + DB notes
- `plan.md` - architecture and security model
- `tasks.md` / `tasks.yaml` - task definitions and dependencies
- `repo_structure.md` - directory boundaries and constraints
- `AGENTS.md` - agent guidance and rules
- `supabase.config.md` - Supabase notes and CLI pointers

**Notes**
- Do not commit secrets. Use root `.env` locally and Supabase secrets for hosted Edge Functions.
- Use `bash scripts/sync-supabase-secrets.sh [project_ref]` to sync Edge Function secrets to hosted Supabase.
