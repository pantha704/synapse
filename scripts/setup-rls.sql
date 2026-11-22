-- Synapse — Row Level Security (tenant-scoped)
-- Run in the Supabase SQL editor, or: psql "$DATABASE_URL" -f scripts/setup-rls.sql
--
-- IMPORTANT: RLS only applies to roles that are NOT the table owner.
-- Supabase's `postgres` role (and any direct DATABASE_URL connection as owner)
-- bypasses every policy below. To make these policies real, the app must reach
-- the data through PostgREST/supabase-js as `authenticated`, or through a
-- dedicated non-owner login role. Otherwise isolation stays application-level.
--
-- Two id types exist in this schema and the old policy file conflated them:
--   users.supabase_id = the Supabase auth uuid (what auth.uid()::text returns)
--   users.id          = the app's cuid (what student_id / teacher_id store)
--
-- Generated: 2026-11-20 (replaces the permissive USING (true) policies)

-- ─── Tenant + app-user resolution ─────────────────────────────────────
create or replace function public.current_institution_id()
returns text
language sql stable security definer set search_path = public
as $$
  -- read the JWT subject as text: seeded/demo rows may not be valid uuids and
  -- auth.uid() would raise instead of returning null
  select u.institution_id
  from users u
  where u.supabase_id = nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub'
  limit 1;
$$;

create or replace function public.current_user_id()
returns text
language sql stable security definer set search_path = public
as $$
  select u.id
  from users u
  where u.supabase_id = nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub'
  limit 1;
$$;

revoke all on function public.current_institution_id() from anon;
revoke all on function public.current_user_id() from anon;
grant execute on function public.current_institution_id() to authenticated;
grant execute on function public.current_user_id() to authenticated;

-- ─── Enable RLS everywhere ────────────────────────────────────────────
alter table institutions              enable row level security;
alter table users                     enable row level security;
alter table batches                   enable row level security;
alter table batch_students            enable row level security;
alter table subjects                  enable row level security;
alter table batch_subjects            enable row level security;
alter table topic_nodes               enable row level security;
alter table resources                 enable row level security;
alter table student_progress          enable row level security;
alter table teacher_progress          enable row level security;
alter table student_resource_progress enable row level security;
alter table engagement_events         enable row level security;
alter table ai_sessions               enable row level security;
alter table ai_messages               enable row level security;
alter table document_chunks           enable row level security;

-- ─── Drop previous policies so this file is re-runnable ───────────────
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('institutions','users','batches','batch_students','subjects',
                        'batch_subjects','topic_nodes','resources','student_progress',
                        'teacher_progress','student_resource_progress','engagement_events',
                        'ai_sessions','ai_messages','document_chunks')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- ─── Institution ──────────────────────────────────────────────────────
create policy institution_read on institutions for select to authenticated
  using (id = public.current_institution_id());

create policy institution_admin_update on institutions for update to authenticated
  using (id = public.current_institution_id()
         and exists (select 1 from users u where u.supabase_id = nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub' and u.role = 'ADMIN'))
  with check (id = public.current_institution_id());

-- ─── Users ────────────────────────────────────────────────────────────
create policy users_read on users for select to authenticated
  using (institution_id = public.current_institution_id());

create policy users_self_update on users for update to authenticated
  using (supabase_id = nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')
  with check (supabase_id = nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub');

-- ─── Batches ──────────────────────────────────────────────────────────
create policy batches_read on batches for select to authenticated
  using (institution_id = public.current_institution_id());

create policy batches_teacher_write on batches for all to authenticated
  using (institution_id = public.current_institution_id() and teacher_id = public.current_user_id())
  with check (institution_id = public.current_institution_id() and teacher_id = public.current_user_id());

-- ─── Batch students ───────────────────────────────────────────────────
create policy batch_students_read on batch_students for select to authenticated
  using (exists (select 1 from batches b
                 where b.id = batch_students.batch_id
                   and b.institution_id = public.current_institution_id()));

create policy batch_students_self_insert on batch_students for insert to authenticated
  with check (student_id = public.current_user_id());

-- ─── Subjects ─────────────────────────────────────────────────────────
create policy subjects_read on subjects for select to authenticated
  using (institution_id = public.current_institution_id());

create policy subjects_write on subjects for all to authenticated
  using (institution_id = public.current_institution_id())
  with check (institution_id = public.current_institution_id());

create policy batch_subjects_read on batch_subjects for select to authenticated
  using (exists (select 1 from subjects s
                 where s.id = batch_subjects.subject_id
                   and s.institution_id = public.current_institution_id()));

-- ─── Topic nodes / resources / chunks (scoped through the subject) ────
create policy topic_nodes_read on topic_nodes for select to authenticated
  using (exists (select 1 from subjects s
                 where s.id = topic_nodes.subject_id
                   and s.institution_id = public.current_institution_id()));

create policy topic_nodes_write on topic_nodes for all to authenticated
  using (exists (select 1 from subjects s
                 where s.id = topic_nodes.subject_id
                   and s.institution_id = public.current_institution_id()))
  with check (exists (select 1 from subjects s
                 where s.id = topic_nodes.subject_id
                   and s.institution_id = public.current_institution_id()));

create policy resources_read on resources for select to authenticated
  using (exists (select 1 from subjects s
                 where s.id = resources.subject_id
                   and s.institution_id = public.current_institution_id()));

create policy resources_write on resources for all to authenticated
  using (exists (select 1 from subjects s
                 where s.id = resources.subject_id
                   and s.institution_id = public.current_institution_id()))
  with check (exists (select 1 from subjects s
                 where s.id = resources.subject_id
                   and s.institution_id = public.current_institution_id()));

create policy document_chunks_read on document_chunks for select to authenticated
  using (exists (select 1 from subjects s
                 where s.id = document_chunks.subject_id
                   and s.institution_id = public.current_institution_id()));

-- ─── Personal progress (own rows only) ────────────────────────────────
create policy student_progress_own on student_progress for all to authenticated
  using (student_id = public.current_user_id())
  with check (student_id = public.current_user_id());

create policy student_resource_progress_own on student_resource_progress for all to authenticated
  using (student_id = public.current_user_id())
  with check (student_id = public.current_user_id());

-- ─── Teacher progress (own batches only) ──────────────────────────────
create policy teacher_progress_own_batches on teacher_progress for all to authenticated
  using (exists (select 1 from batches b
                 where b.id = teacher_progress.batch_id and b.teacher_id = public.current_user_id()))
  with check (exists (select 1 from batches b
                 where b.id = teacher_progress.batch_id and b.teacher_id = public.current_user_id()));

-- ─── Engagement events ────────────────────────────────────────────────
create policy engagement_insert_own on engagement_events for insert to authenticated
  with check (student_id = public.current_user_id());

create policy engagement_read_own on engagement_events for select to authenticated
  using (student_id = public.current_user_id()
         or exists (select 1 from batches b
                    join batch_students bs on bs.batch_id = b.id
                    where bs.student_id = engagement_events.student_id
                      and b.teacher_id = public.current_user_id()));

-- ─── AI sessions / messages ───────────────────────────────────────────
create policy ai_sessions_own on ai_sessions for all to authenticated
  using (student_id = public.current_user_id())
  with check (student_id = public.current_user_id());

create policy ai_messages_read on ai_messages for select to authenticated
  using (exists (select 1 from ai_sessions s
                 where s.id = ai_messages.session_id and s.student_id = public.current_user_id()));

create policy ai_messages_insert on ai_messages for insert to authenticated
  with check (exists (select 1 from ai_sessions s
                 where s.id = ai_messages.session_id and s.student_id = public.current_user_id()));

-- ─── Join by code (the one legitimate cross-tenant read) ──────────────
-- Batches are no longer world-readable; joining goes through this RPC.
create or replace function public.join_batch_by_code(code text)
returns table (batch_id text, batch_name text, institution_id text)
language sql stable security definer set search_path = public
as $$
  select b.id, b.name, b.institution_id
  from batches b
  where b.join_code = upper(trim(code))
  limit 1;
$$;

revoke all on function public.join_batch_by_code(text) from anon;
grant execute on function public.join_batch_by_code(text) to authenticated;

-- ─── Server role access ───────────────────────────────────────────────
-- Prisma connects as `synapse_app`. Supabase's service_role gets this by
-- BYPASSRLS; a plain login role cannot, so it gets an explicit policy instead.
-- The browser path (anon / authenticated) stays tenant-scoped by the policies
-- above — this only widens what the trusted server connection may do.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    -- RLS must be on before any policy means anything. Enabling it here, for every
    -- table that exists, is what stops a new migration from shipping a world-readable
    -- table: the four tables added by migrations 1 and 2 were readable with the anon
    -- key until this loop covered them.
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('drop policy if exists app_service_access on public.%I', t.tablename);
    execute format('create policy app_service_access on public.%I to synapse_app using (true) with check (true)', t.tablename);
  end loop;
end $$;

-- The app role may switch into the client roles, which is how the isolation test
-- and any scoped query run. authenticated carries only SELECT grants + policies.
grant authenticated to synapse_app;
grant anon to synapse_app;

-- ─── Guard ────────────────────────────────────────────────────────────
-- A table with RLS off is readable by anyone holding the anon key, which ships
-- in the browser bundle. Refuse to finish quietly in that state.
do $$
declare offenders text;
begin
  select string_agg(c.relname, ', ')
    into offenders
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

  if offenders is not null then
    raise exception 'RLS is disabled on: %', offenders;
  end if;
end $$;
