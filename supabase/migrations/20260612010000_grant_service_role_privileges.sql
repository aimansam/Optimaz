-- Grant full table/sequence access to service_role.
-- The service_role is used by server-side admin clients (e.g. admin monitoring page,
-- account deletion). It bypasses RLS but still requires PostgreSQL object-level grants.
-- Without this, service_role gets "permission denied for table X" errors.

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure future tables also get service_role access automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
