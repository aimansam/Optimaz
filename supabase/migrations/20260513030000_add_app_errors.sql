create extension if not exists pgcrypto;

create table if not exists public.app_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  source text not null check (source in ('client', 'server', 'manual')),
  message text not null check (char_length(message) between 1 and 1000),
  stack text,
  digest text,
  path text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_errors_user_id_idx on public.app_errors(user_id);
create index if not exists app_errors_source_idx on public.app_errors(source);
create index if not exists app_errors_created_at_idx on public.app_errors(created_at desc);

alter table public.app_errors enable row level security;

create policy "Anyone can insert app errors" on public.app_errors
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "Users can view own app errors" on public.app_errors
  for select using (auth.uid() = user_id);
