-- pending_otps: temporary OTP codes stored server-side before Supabase user is created.
-- Codes expire after 10 minutes and are rate-limited to 5 attempts per entry.

CREATE TABLE IF NOT EXISTS public.pending_otps (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  email         text        NOT NULL,
  code_hash     text        NOT NULL,          -- bcrypt / SHA-256 hash of the 6-digit code
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  attempts      integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Only one active OTP per email at a time (enforced by upsert in the API route)
CREATE UNIQUE INDEX IF NOT EXISTS pending_otps_email_idx ON public.pending_otps (email);

-- Auto-delete expired rows (keep table tidy; also done in the verify route)
CREATE INDEX IF NOT EXISTS pending_otps_expires_idx ON public.pending_otps (expires_at);

-- RLS: this table is only accessed by service-role (API routes use admin client)
ALTER TABLE public.pending_otps ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — all access via service-role key in server routes
