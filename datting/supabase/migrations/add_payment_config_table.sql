-- Payment config table: Stripe publishable key aur webhook secret store karne ke liye
-- Supabase SQL Editor mein run karein (self-hosted ya cloud)

-- Table create karein (agar pehle se 'payment' naam ka table hai to neeche wala ALTER use karein)
CREATE TABLE IF NOT EXISTS payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'default',
  publishable_key TEXT,
  webhook_secret TEXT,
  secret_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name)
);

-- Optional: agar aap table ka naam sirf "payment" rakhna chahte ho
-- CREATE TABLE IF NOT EXISTS payment (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   publishable_key TEXT,
--   webhook_secret TEXT,
--   secret_key TEXT,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );

-- Agar aapka pehle se "payment" table hai to sirf columns add karein:
-- ALTER TABLE payment
--   ADD COLUMN IF NOT EXISTS publishable_key TEXT,
--   ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Default row (admin baad mein values update kar sakta hai)
INSERT INTO payment_config (name, publishable_key, webhook_secret)
VALUES ('default', NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security) – zaroorat ho to enable karein
-- ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admin only" ON payment_config FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE payment_config IS 'Stripe keys: publishable_key (pk_), webhook_secret (whsec_), optional secret_key (sk_)';
