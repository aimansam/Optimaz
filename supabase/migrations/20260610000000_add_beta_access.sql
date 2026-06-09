-- Migration: Add beta_access table
-- Beta users get full Pro access during beta period.
-- On v1.0 launch: run UPDATE beta_access SET pro_expires_at = NOW() + INTERVAL '1 month';
-- After beta ends: DROP TABLE beta_access; (and remove code checks)

CREATE TABLE IF NOT EXISTS public.beta_access (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at    timestamptz NOT NULL DEFAULT now(),
  pro_expires_at timestamptz DEFAULT NULL  -- NULL = still in beta (no expiry yet)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS beta_access_user_id_idx ON public.beta_access (user_id);

-- RLS
ALTER TABLE public.beta_access ENABLE ROW LEVEL SECURITY;

-- Users can only read their own row
CREATE POLICY "Users can read own beta access"
  ON public.beta_access
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can insert/update/delete (admin operations only)
CREATE POLICY "Service role can manage beta access"
  ON public.beta_access
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Auto-grant beta access to every new user who signs up during the beta period.
-- To stop granting beta access to new signups: DROP this trigger before v1.0 launch.
CREATE OR REPLACE FUNCTION public.grant_beta_access_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.beta_access (user_id, granted_at)
  VALUES (NEW.id, now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_beta_access
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_beta_access_on_signup();

-- ============================================================
-- HOW TO USE
-- ============================================================
--
-- CHECK if user has active Pro (in your app code / RLS policies):
--   SELECT EXISTS (
--     SELECT 1 FROM beta_access
--     WHERE user_id = auth.uid()
--       AND (pro_expires_at IS NULL OR pro_expires_at > now())
--   ) AS has_beta_pro;
--
-- ON v1.0 LAUNCH DAY — give all beta users 1 month free Pro:
--   UPDATE beta_access
--   SET pro_expires_at = now() + INTERVAL '1 month'
--   WHERE pro_expires_at IS NULL;
--
-- AFTER BETA FULLY ENDS (clean up):
--   1. Remove beta_access checks from your codebase
--   2. DROP TRIGGER on_auth_user_created_beta_access ON auth.users;
--   3. DROP FUNCTION public.grant_beta_access_on_signup();
--   4. DROP TABLE public.beta_access;
-- ============================================================
