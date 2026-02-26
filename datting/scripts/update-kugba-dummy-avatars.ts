/**
 * Existing 50 dummy profiles (dummy.kugba.100km.*@test.com) ka avatar_url update karo.
 * Run: cd datting && npx ts-node scripts/update-kugba-dummy-avatars.ts
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://supabase.kubsy.app";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY .env mein set karein");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const AVATAR_URL =
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1768400944832-rn1sms7oac8.jpeg";

const EMAIL_PATTERN = /^dummy\.kugba\.100km\.\d+@test\.com$/;

async function main() {
  console.log("🔍 Auth users list ho rahi hai (dummy.kugba.100km.*)...\n");

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
    console.log("⚠️ Koi dummy.kugba.100km.* user nahi mila.");
    process.exit(0);
  }

  console.log(`✅ ${userIds.length} users milé. Avatar URL update ho raha hai...\n`);

  let updated = 0;
  for (const id of userIds) {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: AVATAR_URL, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error(`❌ ${id}: ${error.message}`);
    } else {
      updated++;
      console.log(`✅ Updated profile ${id}`);
    }
  }

  console.log(`\n✅ Done. Updated: ${updated}/${userIds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
