-- ============================================================
-- Optimaz — Full Production Schema
-- Project: ielsqkzxdqnhdeqmblra (Singapore, ap-southeast-1)
-- Generated: 2026-06-11T19:18:44.585Z
-- !! This file reflects the live schema. Do not edit manually.
-- !! Use migrations in supabase/migrations/ for changes.
-- ============================================================

-- Table: analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own analytics events" ON public.analytics_events FOR SELECT USING ((auth.uid() = user_id));

-- Table: app_errors
CREATE TABLE IF NOT EXISTS public.app_errors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  source text NOT NULL,
  message text NOT NULL,
  stack text,
  digest text,
  path text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert app errors" ON public.app_errors FOR INSERT WITH CHECK (((user_id IS NULL) OR (auth.uid() = user_id)));
CREATE POLICY "Users can view own app errors" ON public.app_errors FOR SELECT USING ((auth.uid() = user_id));

-- Table: beta_access
CREATE TABLE IF NOT EXISTS public.beta_access (
  user_id uuid NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  pro_expires_at timestamptz
);

ALTER TABLE public.beta_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage beta access" ON public.beta_access FOR ALL USING ((auth.role() = 'service_role'::text));
CREATE POLICY "Users can read own beta access" ON public.beta_access FOR SELECT USING ((auth.uid() = user_id));

-- Table: feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general'::text,
  message text NOT NULL,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback" ON public.feedback FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING ((auth.uid() = user_id));

-- Table: goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1'::text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING ((auth.uid() = user_id));

-- Table: notification_deliveries
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL,
  delivery_type text NOT NULL,
  reminder_key text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification deliveries" ON public.notification_deliveries FOR SELECT USING ((auth.uid() = user_id));

-- Table: pricing_waitlist
CREATE TABLE IF NOT EXISTS public.pricing_waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  intent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join pricing waitlist" ON public.pricing_waitlist FOR INSERT WITH CHECK (((user_id IS NULL) OR (auth.uid() = user_id)));

-- Table: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  parent_project_id uuid,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1'::text,
  favorite boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  tags text[] DEFAULT ARRAY[]::text[]
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING ((auth.uid() = user_id));

-- Table: push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions FOR ALL USING ((auth.uid() = user_id));

-- Table: saved_views
CREATE TABLE IF NOT EXISTS public.saved_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  view_type text NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own saved views" ON public.saved_views FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own saved views" ON public.saved_views FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own saved views" ON public.saved_views FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own saved views" ON public.saved_views FOR UPDATE USING ((auth.uid() = user_id));

-- Table: subtasks
CREATE TABLE IF NOT EXISTS public.subtasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own subtasks" ON public.subtasks FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own subtasks" ON public.subtasks FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own subtasks" ON public.subtasks FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own subtasks" ON public.subtasks FOR UPDATE USING ((auth.uid() = user_id));

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  project_id uuid,
  title text NOT NULL,
  notes text,
  priority text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'todo'::text,
  due_date date,
  due_time time without time zone,
  due_timezone text,
  position integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  archived_at timestamptz,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  recurrence_weekdays ARRAY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  goal_id uuid
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING ((auth.uid() = user_id));
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING ((auth.uid() = user_id));

-- Table: pending_otps
CREATE TABLE IF NOT EXISTS public.pending_otps (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  code_hash  text        NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  attempts   integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS pending_otps_email_idx ON public.pending_otps (email);
CREATE INDEX IF NOT EXISTS pending_otps_expires_idx ON public.pending_otps (expires_at);

ALTER TABLE public.pending_otps ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies — accessed only via service-role key in server routes

-- ============================================================
-- Grants
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.pricing_waitlist TO anon;
GRANT INSERT ON public.app_errors TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;
