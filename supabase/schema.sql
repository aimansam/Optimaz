-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_project_id uuid references public.projects(id) on delete set null,
  name text not null,
  description text,
  color text not null default '#6366f1',
  favorite boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  notes text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  position integer not null default 0,
  completed_at timestamptz,
  archived_at timestamptz,
  -- Recurring
  is_recurring boolean not null default false,
  recurrence_rule text, -- 'daily' | 'weekly' | 'monthly'
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subtasks table
create table if not exists public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Goals table
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#6366f1',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add goal_id to tasks
alter table public.tasks
  add column if not exists goal_id uuid references public.goals(id) on delete set null;

-- Push subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Analytics events table
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general' check (category in ('general', 'bug', 'idea', 'pricing')),
  message text not null check (char_length(message) between 3 and 2000),
  page_path text,
  created_at timestamptz not null default now()
);

-- Saved views table
create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  view_type text not null check (view_type in ('kanban')),
  name text not null check (char_length(name) between 1 and 80),
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notification deliveries table
create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  delivery_type text not null check (delivery_type in ('task_reminder')),
  reminder_key text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists tasks_goal_id_idx on public.tasks(goal_id);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists projects_parent_project_id_idx on public.projects(parent_project_id);
create index if not exists projects_user_parent_idx on public.projects(user_id, parent_project_id, archived);
create index if not exists tasks_active_user_status_idx on public.tasks(user_id, status, position) where archived_at is null;
create index if not exists tasks_user_completed_at_idx on public.tasks(user_id, completed_at desc) where completed_at is not null;
create index if not exists tasks_user_archived_at_idx on public.tasks(user_id, archived_at desc) where archived_at is not null;
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
create index if not exists feedback_category_idx on public.feedback(category);
create index if not exists saved_views_user_type_idx on public.saved_views(user_id, view_type, updated_at desc);
create unique index if not exists saved_views_user_type_name_idx on public.saved_views(user_id, view_type, name);
create unique index if not exists notification_deliveries_unique_reminder_idx on public.notification_deliveries(user_id, task_id, delivery_type, reminder_key);
create index if not exists notification_deliveries_user_sent_idx on public.notification_deliveries(user_id, sent_at desc);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create or replace trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create or replace trigger goals_updated_at
  before update on public.goals
  for each row execute function public.handle_updated_at();

create or replace trigger saved_views_updated_at
  before update on public.saved_views
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.goals enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feedback enable row level security;
alter table public.saved_views enable row level security;
alter table public.notification_deliveries enable row level security;

-- Goals policies
create policy "Users can view own goals" on public.goals
  for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals
  for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals
  for delete using (auth.uid() = user_id);

-- Projects policies
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Subtasks policies
create policy "Users can view own subtasks" on public.subtasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own subtasks" on public.subtasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own subtasks" on public.subtasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own subtasks" on public.subtasks
  for delete using (auth.uid() = user_id);

-- Push subscriptions policies
create policy "Users can manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- Analytics events policies
create policy "Users can insert own analytics events" on public.analytics_events
  for insert with check (auth.uid() = user_id);
create policy "Users can view own analytics events" on public.analytics_events
  for select using (auth.uid() = user_id);

-- Feedback policies
create policy "Users can insert own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);
create policy "Users can view own feedback" on public.feedback
  for select using (auth.uid() = user_id);

-- Saved views policies
create policy "Users can view own saved views" on public.saved_views
  for select using (auth.uid() = user_id);
create policy "Users can insert own saved views" on public.saved_views
  for insert with check (auth.uid() = user_id);
create policy "Users can update own saved views" on public.saved_views
  for update using (auth.uid() = user_id);
create policy "Users can delete own saved views" on public.saved_views
  for delete using (auth.uid() = user_id);

-- Notification delivery policies
create policy "Users can view own notification deliveries" on public.notification_deliveries
  for select using (auth.uid() = user_id);
