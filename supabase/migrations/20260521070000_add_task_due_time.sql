alter table public.tasks
  add column if not exists due_time time,
  add column if not exists due_timezone text;