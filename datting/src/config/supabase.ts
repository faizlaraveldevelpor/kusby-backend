import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = "https://supabase.kubsy.app/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/** RLS bypass ke liye – sirf expo_push_token jaisi server-side updates. .env mein SUPABASE_SERVICE_ROLE_KEY set karein. */
let _adminClient: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient) return _adminClient;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  _adminClient = createClient(supabaseUrl, key);
  return _adminClient;
}