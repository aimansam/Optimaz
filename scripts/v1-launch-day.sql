-- ============================================================
-- Optimaz v1.0 Launch Day SQL
-- Run this in Supabase SQL Editor (production) on launch day.
-- ============================================================

-- Step 1: Give all beta users exactly 1 month of free Pro
--         starting from today (launch day).
UPDATE public.beta_access
SET pro_expires_at = now() + INTERVAL '1 month'
WHERE pro_expires_at IS NULL;

-- Step 2: Stop auto-granting beta access to new signups.
--         New users will now go through the normal (Stripe) flow.
DROP TRIGGER IF EXISTS on_auth_user_created_beta_access ON auth.users;

-- ============================================================
-- That's it! After running:
--   - All existing beta users → 1 month free Pro (from today)
--   - New signups → no beta access (must subscribe)
--   - useHasBetaPro() in the app will automatically start
--     returning false once their month expires
--
-- After the 1 month grace period ends, run the cleanup below
-- to fully remove the beta system:
-- ============================================================

-- CLEANUP (run ~1 month after launch, after removing code checks):
--
-- DROP FUNCTION IF EXISTS public.grant_beta_access_on_signup();
-- DROP TABLE IF EXISTS public.beta_access;
--
-- Then delete:
--   src/hooks/use-beta-access.ts
--   supabase/migrations/20260610000000_add_beta_access.sql
--   scripts/v1-launch-day.sql  (this file)
-- ============================================================
