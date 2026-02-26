/**
 * Google login – account select ke baad redirect receive karke session set karta hai.
 * Is file ko apni Expo app mein copy karo (e.g. lib/auth.ts ya services/auth.ts).
 *
 * Use: const result = await signInWithGoogle(); if (result.success) router.replace('/(tabs)');
 */

import * as WebBrowser from 'expo-web-browser';
import { SupabaseClient } from '@supabase/supabase-js';

const REDIRECT_URL = 'kubsy://auth-callback';

export async function signInWithGoogle(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No auth URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);

  if (result.type !== 'success') {
    return { success: false as const, cancelled: result.type === 'cancel' };
  }

  await createSessionFromUrl(supabase, result.url);
  return { success: true as const };
}

function createSessionFromUrl(supabase: SupabaseClient, url: string) {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  if (!hash) throw new Error('No hash in redirect URL');
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token) throw new Error('No access_token in redirect');
  return supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
}
