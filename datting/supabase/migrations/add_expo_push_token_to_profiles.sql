-- Add expo_push_token to profiles if missing (profile get / push notifications ke liye)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expo_push_token text NULL;

COMMENT ON COLUMN public.profiles.expo_push_token IS 'Expo push token for mobile notifications';
