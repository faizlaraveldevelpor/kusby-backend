/**
 * Self-hosted Supabase (supabase/docker/.env) se profile get karo by full_name.
 * Run: cd kubsy/datting && npx ts-node scripts/get-profile-from-selfhosted.ts "med mass"
 */

const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, "../../../../supabase/docker/.env");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  env.split("\n").forEach((line: string) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
}

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_PUBLIC_URL || "https://supabase.kubsy.app";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const searchName = process.argv[2] || "med mass";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ supabase/docker/.env mein SERVICE_ROLE_KEY set karein");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("full_name", `%${searchName}%`)
    .limit(5)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  if (!data?.length) {
    console.log(`⚠️ "${searchName}" naam se koi profile nahi mili.`);
    process.exit(0);
  }

  console.log(`✅ ${data.length} profile(s) mili (self-hosted Supabase se):\n`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
