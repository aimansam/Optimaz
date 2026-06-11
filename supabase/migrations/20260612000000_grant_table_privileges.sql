-- Grant table privileges to anon and authenticated roles.
-- Supabase normally applies these automatically via the dashboard,
-- but manual schema application skips them. This migration ensures
-- all public tables are accessible to the correct roles.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- authenticated role: full CRUD on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- anon role: read-only by default
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- anon-specific INSERT overrides (public pages that don't require auth)
GRANT INSERT ON public.pricing_waitlist TO anon;  -- /pricing waitlist signup form
GRANT INSERT ON public.app_errors TO anon;        -- error monitoring on unauthenticated pages

-- Ensure future tables also get these privileges automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
