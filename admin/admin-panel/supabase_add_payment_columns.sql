-- Payment table mein Stripe keys ke liye columns add karein
-- VPS Supabase: SQL Editor mein ye paste karke Run karein

ALTER TABLE payment
  ADD COLUMN IF NOT EXISTS publishable_key TEXT,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
  ADD COLUMN IF NOT EXISTS secret_key TEXT;

COMMENT ON COLUMN payment.publishable_key IS 'Stripe publishable key (pk_test_... or pk_live_...)';
COMMENT ON COLUMN payment.webhook_secret IS 'Stripe webhook signing secret (whsec_...)';
COMMENT ON COLUMN payment.secret_key IS 'Stripe secret key (sk_test_... or sk_live_...)';
