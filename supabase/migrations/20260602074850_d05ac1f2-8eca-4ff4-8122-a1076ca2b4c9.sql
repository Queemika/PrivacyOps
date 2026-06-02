
CREATE TABLE public.login_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_otps_email_lookup ON public.login_otps (email, used, expires_at DESC);
CREATE INDEX idx_login_otps_email_created ON public.login_otps (email, created_at DESC);

GRANT ALL ON public.login_otps TO service_role;

ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions using the service role may access this table.
