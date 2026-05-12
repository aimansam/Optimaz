alter table public.projects
  add column if not exists favorite boolean not null default false,
  add column if not exists archived boolean not null default false;
