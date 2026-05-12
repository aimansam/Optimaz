create extension if not exists pgcrypto;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general' check (category in ('general', 'bug', 'idea', 'pricing')),
  message text not null check (char_length(message) between 3 and 2000),
  page_path text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
create index if not exists feedback_category_idx on public.feedback(category);

alter table public.feedback enable row level security;

create policy "Users can insert own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can view own feedback" on public.feedback
  for select using (auth.uid() = user_id);
