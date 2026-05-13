create extension if not exists pgcrypto;

create table if not exists public.pricing_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  intent text check (intent is null or char_length(intent) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists pricing_waitlist_user_id_idx on public.pricing_waitlist(user_id);
create index if not exists pricing_waitlist_created_at_idx on public.pricing_waitlist(created_at desc);

alter table public.pricing_waitlist enable row level security;

create policy "Anyone can join pricing waitlist" on public.pricing_waitlist
  for insert with check (user_id is null or auth.uid() = user_id);