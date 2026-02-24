-- ============================================================
-- Agar app se expo_push_token save nahi ho raha ho to ye policy add karein.
-- Supabase Dashboard → SQL Editor mein ye script chalao.
-- ============================================================

-- 1. Check: kya profiles pe RLS enabled hai?
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';

-- 2. Authenticated user apni hi profile row update kar sake (expo_push_token ke liye)
-- Policy naam alag ho sakta hai; agar pehle se "Users can update own profile" jaisi policy hai to ye skip karein.

DROP POLICY IF EXISTS "Users can update own profile expo_push_token" ON public.profiles;
CREATE POLICY "Users can update own profile expo_push_token"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Agar aap anon role se bhi update allow karna chahte ho (e.g. app mein session nahi bhej rahe):
-- TO public / TO anon use karke alag policy bana sakte ho, lekin security ke liye authenticated better hai.

-- 3. Verify: App mein Supabase client logged-in user ke session ke saath request bhejta hai.
--    Tab auth.uid() = id match karega aur update allow hoga.
