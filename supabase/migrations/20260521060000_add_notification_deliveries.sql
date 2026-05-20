create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  delivery_type text not null check (delivery_type in ('task_reminder')),
  reminder_key text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists notification_deliveries_unique_reminder_idx
  on public.notification_deliveries(user_id, task_id, delivery_type, reminder_key);

create index if not exists notification_deliveries_user_sent_idx
  on public.notification_deliveries(user_id, sent_at desc);

alter table public.notification_deliveries enable row level security;

create policy "Users can view own notification deliveries" on public.notification_deliveries
  for select using (auth.uid() = user_id);