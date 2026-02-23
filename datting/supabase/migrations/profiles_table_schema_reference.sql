-- ============================================================
-- PROFILES TABLE – Schema reference (Supabase actual schema)
-- Ye file sirf reference ke liye hai; table pehle se bana hua hai.
-- ============================================================

-- Table: public.profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NULL,
  nickname text NULL,
  date_of_birth date NULL,
  gender text NULL,
  avatar_url text NULL,
  location jsonb NULL,
  email text NULL,
  phone text NULL,
  images text[] NULL DEFAULT '{}'::text[],
  interests text[] NULL DEFAULT '{}'::text[],
  is_vip boolean NULL DEFAULT false,
  daily_swipes_count integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  about text NULL,
  profession text NULL,
  expo_push_token text NULL,
  blocked_profiles uuid[] NULL DEFAULT '{}'::uuid[],
  member_ship_type text NULL DEFAULT 'free'::text,
  membership_expires_at timestamp with time zone NULL,
  last_like_reset timestamp with time zone NULL,
  last_payment_id text NULL,
  cetagory text NULL,
  admin boolean NULL,
  adminblock boolean NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Trigger: update updated_at on row update
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
