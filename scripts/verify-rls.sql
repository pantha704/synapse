-- Proves tenant isolation. Run once per institution with psql:
--   psql "$DATABASE_URL" -v inst="Demo University" -f scripts/verify-rls.sql
-- Expect: subjects/topics counts for THAT institution only; zero for any other.
begin;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select u.supabase_id
            from users u
            join institutions i on i.id = u.institution_id
            where i.name = :'inst'
            limit 1)
  )::text,
  true
);

set local role authenticated;

select current_user                                            as role,
       public.current_institution_id()                          as tenant,
       (select count(*) from subjects)                          as subjects_visible,
       (select count(*) from topic_nodes)                       as topics_visible,
       (select count(*) from student_progress)                  as progress_visible;

-- A cross-tenant probe: rows from any OTHER institution must be 0.
select count(*) as foreign_rows_visible
from subjects s
where s.institution_id <> public.current_institution_id();

rollback;
