create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  view_type text not null check (view_type in ('kanban')),
  name text not null check (char_length(name) between 1 and 80),
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_views_user_type_idx
  on public.saved_views(user_id, view_type, updated_at desc);

create unique index if not exists saved_views_user_type_name_idx
  on public.saved_views(user_id, view_type, name);

create or replace trigger saved_views_updated_at
  before update on public.saved_views
  for each row execute function public.handle_updated_at();

alter table public.saved_views enable row level security;

create policy "Users can view own saved views" on public.saved_views
  for select using (auth.uid() = user_id);
create policy "Users can insert own saved views" on public.saved_views
  for insert with check (auth.uid() = user_id);
create policy "Users can update own saved views" on public.saved_views
  for update using (auth.uid() = user_id);
create policy "Users can delete own saved views" on public.saved_views
  for delete using (auth.uid() = user_id);