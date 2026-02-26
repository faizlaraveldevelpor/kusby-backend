/**
 * Jo 50 Med Mass-style dummy profiles create ki thi (dummy.medmass.*@test.com) unhe get karo.
 * Run: cd kubsy/datting && npx ts-node scripts/get-medmass-dummy-profiles.ts
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

if (!SERVICE_ROLE_KEY) {
  console.error("❌ supabase/docker/.env mein SERVICE_ROLE_KEY set karein");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const EMAIL_PATTERN = /^dummy\.medmass\.\d+@test\.com$/;

async function main() {
  console.error("🔍 dummy.medmass.* users list ho rahi hai...\n");

  const userIds: string[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error("❌ List users error:", error.message);
      process.exit(1);
    }

    const users = data?.users ?? [];
    for (const u of users) {
      if (u.email && EMAIL_PATTERN.test(u.email)) userIds.push(u.id);
    }

    if (users.length < perPage) break;
    page++;
  }

  if (userIds.length === 0) {
    console.error("⚠️ Koi dummy.medmass.* profile nahi mili.");
    process.exit(0);
  }

  console.error(`✅ ${userIds.length} user(s) milé. Profiles fetch ho rahi hain...\n`);

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds)
    .order("full_name", { ascending: true });

  if (profileError) {
    console.error("❌ Profiles fetch error:", profileError.message);
    process.exit(1);
  }

  // Sirf JSON stdout pe (redirect ke liye valid JSON file)
  process.stdout.write(JSON.stringify(profiles || [], null, 2));
  console.error(`\n✅ Total: ${(profiles || []).length} profiles`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
