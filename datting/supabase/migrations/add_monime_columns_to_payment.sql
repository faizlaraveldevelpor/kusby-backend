-- Monime.io – payment table mein columns (Stripe columns bilkul change nahi)
ALTER TABLE payment ADD COLUMN IF NOT EXISTS monime_token TEXT;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS monime_space TEXT;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS monime_spcae TEXT;
ALTER TABLE payment ADD COLUMN IF NOT EXISTS monime_webhook_secret TEXT;

COMMENT ON COLUMN payment.monime_token IS 'Monime API token (mon_ or mon_test_)';
COMMENT ON COLUMN payment.monime_space IS 'Monime Space ID (spc_...)';
COMMENT ON COLUMN payment.monime_webhook_secret IS 'Monime webhook HMAC secret (32+ chars)';
