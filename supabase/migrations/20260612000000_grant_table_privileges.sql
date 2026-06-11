-- Grant table privileges to anon and authenticated roles.
-- Supabase normally applies these automatically via the dashboard,
-- but manual schema application skips them. This migration ensures
-- all public tables are accessible to the correct roles.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- authenticated role: full CRUD on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- anon role: read-only (public pages like pricing waitlist INSERT is handled by RLS)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure future tables also get these privileges automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
