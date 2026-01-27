# Supabase Configuration (Project + Local)

This file records non-secret Supabase configuration and points to where secrets
must live. Do **not** commit real keys here.

## Local Development

- project_id: super-body (from `supabase/config.toml`)
- api_port: 54321
- db_port: 5432
- auth: enable_signup=true, email_autoconfirm=false
- storage: enabled (local MinIO config in `supabase/config.toml`)
- realtime: enabled

## Hosted Project (TODO: fill after login)

- project_ref: TODO
- project_url (SUPABASE_URL): TODO
- anon_key (SUPABASE_ANON_KEY): TODO
- service_role_key (SUPABASE_SERVICE_ROLE_KEY): TODO

### How to populate (requires Supabase CLI login)

```bash
supabase login
supabase projects list
supabase projects api-keys --project-ref <project_ref>
```

### Secrets handling

- Store keys in `.env.local` (local dev) or Supabase secrets (prod).
- Never hardcode or commit keys in repo.
