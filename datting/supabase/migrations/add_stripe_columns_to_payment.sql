-- Option 2: Agar aapka table ka naam "payment" hai aur aap sirf columns add karna chahte ho

-- Table 'payment' mein publishable_key aur webhook_secret columns add karein
ALTER TABLE payment
  ADD COLUMN IF NOT EXISTS publishable_key TEXT,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Optional: secret key bhi rakhna ho (backend ke liye, secure rehne do)
-- ALTER TABLE payment ADD COLUMN IF NOT EXISTS secret_key TEXT;

COMMENT ON COLUMN payment.publishable_key IS 'Stripe publishable key (pk_test_... or pk_live_...)';
COMMENT ON COLUMN payment.webhook_secret IS 'Stripe webhook signing secret (whsec_...)';
