alter table public.tasks
  add column if not exists completed_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.tasks
set completed_at = coalesce(completed_at, updated_at)
where status = 'done'
  and completed_at is null;

create index if not exists tasks_active_user_status_idx
  on public.tasks(user_id, status, position)
  where archived_at is null;

create index if not exists tasks_user_completed_at_idx
  on public.tasks(user_id, completed_at desc)
  where completed_at is not null;

create index if not exists tasks_user_archived_at_idx
  on public.tasks(user_id, archived_at desc)
  where archived_at is not null;