# Supabase setup (verified 2026-11-22)

Project: **synapse** · ref `gbfzbdlcxgbwdamaydzd` · region `ap-northeast-2` · Postgres 17.6
Status: was `INACTIVE` (free-tier pause since April), restored and verified live.

## Connection

`.env.local` (gitignored, mode 0600) holds the real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://gbfzbdlcxgbwdamaydzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy anon JWT>
SUPABASE_SERVICE_ROLE_KEY=<legacy service_role JWT>
DATABASE_URL=postgresql://synapse_app:<password>@db.gbfzbdlcxgbwdamaydzd.supabase.co:5432/postgres
```

`synapse_app` is a dedicated login role (`NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`)
created for the app. Supabase's own `postgres` password is unknown to us and cannot be
reset through the Management API, so this role is the supported path.

## Migrations

Migrations are applied through the Management API (`POST /v1/projects/{ref}/database/query`)
because the CLI needs the owner password. Files live in `prisma/migrations/`.

| migration | state |
| --- | --- |
| `1_announcements` | applied |
| `2_assignments` | applied |
| `0_init` | **not** applied — those tables already existed from the April build |

`pgvector` is installed; `document_chunks.embedding` is `vector(1024)`.

## Row Level Security

`scripts/setup-rls.sql` is applied and re-runnable.

- 24 tenant-scoped policies — every read resolves through
  `current_institution_id()` / `current_user_id()`, which read the JWT subject from
  `current_setting('request.jwt.claims')` **as text**. `auth.uid()` casts to `uuid` and
  raises `22P02` on seeded rows whose `supabase_id` is not a uuid, so it must not be used
  in these helpers.
- 19 `app_service_access` policies grant the `synapse_app` role full access. Supabase's
  `service_role` gets this via `BYPASSRLS`; a plain login role cannot, so an explicit
  policy is the equivalent. **The browser path (anon/authenticated) stays tenant-scoped.**
- `join_batch_by_code(text)` is the only sanctioned cross-tenant read; batches are no
  longer world-readable.

### Isolation check (real output, 2026-11-22)

`scripts/verify-rls.sql`, run per institution:

| acting as | tenant | subjects | topics | progress |
| --- | --- | --- | --- | --- |
| Demo Institution / TEACHER | `cmnmsq0nm…` | **0** | **0** | **0** |
| Demo University / TEACHER | `cmnngex2s…` | 3 | 22 | 0 |
| Demo University / STUDENT | `cmnngex2s…` | 3 | 22 | 14 (own only) |
| Demo University / ADMIN | `cmnngex2s…` | 3 | 22 | 0 |

A user in one institution sees nothing from the other. That is the P0-6 acceptance test,
passed against the live database rather than asserted.

## Known gap

The April seed wrote placeholder ids (`demo-teacher-1`) into `users.supabase_id`, so those
rows cannot sign in. A fresh seed must create real Supabase auth users (admin API) and map
the returned uuids — otherwise a real login lands on empty states.
