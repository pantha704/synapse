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

## Storage

Bucket `resources` created (public read, service-role write). Uploads go through
`uploadAndIngestResource`, which stores the file under `<institutionId>/<topicId>/`,
creates the `Resource` row, and indexes PDFs into `document_chunks` in the same call.

## AI provider reality (2026-11-22)

- Groq retired `nvidia/nv-embedqa-e5-v5` on 2026-08-25 — its embeddings endpoint now
  returns 404. The NIM keys on this account are not provisioned for embeddings (403).
- The vector path is therefore opt-in via `EMBEDDING_BASE_URL`, `EMBEDDING_MODEL`,
  `EMBEDDING_API_KEY`. Without them retrieval uses Postgres full-text search
  (`websearch_to_tsquery`, GIN index from migration `3_fts`).
- Groq no longer serves `llama-3.3-70b-versatile`; `CHAT_MODEL` defaults to
  `openai/gpt-oss-120b` and was verified with a live completion.

## Demo accounts (password `SynapseDemo2026!`)

| account | role |
| --- | --- |
| teacher@demo.synapse.dev | TEACHER |
| student1..10@demo.synapse.dev | STUDENT |
| admin@demo.synapse.dev | ADMIN + platform operator |

`npm run seed` creates them as real Supabase auth users, wipes the previous demo tenant
and rebuilds batches, topics, progress, engagement, announcements and assignments.
