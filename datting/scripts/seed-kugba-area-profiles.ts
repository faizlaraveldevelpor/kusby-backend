/**
 * Pehle Kugba profile DB se get karo, phir usi jaisi 50 dummy profiles create karo.
 * avatar_url override: user diya hua URL.
 * Run: cd datting && npx ts-node scripts/seed-kugba-area-profiles.ts
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

const RADIUS_KM = 100;
const COUNT = 50;
const AVATAR_URL =
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1768400944832-rn1sms7oac8.jpeg";

// Random point within radius (approx, in km)
function randomPointWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): { latitude: number; longitude: number } {
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.sqrt(Math.random()) * radiusKm;
  const kmPerDegLat = 111;
  const kmPerDegLon = 111 * Math.cos((centerLat * Math.PI) / 180);
  const latOffset = (dist / kmPerDegLat) * Math.cos(angle);
  const lonOffset = (dist / kmPerDegLon) * Math.sin(angle);
  return {
    latitude: centerLat + latOffset,
    longitude: centerLon + lonOffset,
  };
}

// 50 dummy names (varied)
const DUMMY_NAMES = [
  "Adam", "Ben", "Chris", "David", "Ethan", "Frank", "George", "Henry", "Ivan", "Jack",
  "Kevin", "Leo", "Mark", "Neil", "Oscar", "Paul", "Quinn", "Ryan", "Sam", "Tom",
  "Victor", "Will", "Xavier", "Yuri", "Zack", "Alex", "Blake", "Cody", "Drew", "Evan",
  "Felix", "Gabe", "Hugo", "Ian", "Jake", "Kyle", "Luke", "Max", "Noah", "Owen",
  "Pete", "Reed", "Sean", "Troy", "Vince", "Wade", "Zane", "Aiden", "Brody", "Cole",
];

async function getKugbaProfile(): Promise<any> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or("full_name.ilike.%kugba%,full_name.eq.Kugba")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Kugba profile fetch error: ${error.message}`);
  }
  if (!data) {
    throw new Error("Kugba profile nahi mili. full_name mein 'Kugba' check karein.");
  }
  return data;
}

function buildDummyProfile(
  kugba: any,
  userId: string,
  fullName: string,
  location: { latitude: number; longitude: number }
) {
  const now = new Date().toISOString();
  const { id, full_name, created_at, updated_at, ...rest } = kugba;
  return {
    id: userId,
    full_name: fullName,
    ...rest,
    avatar_url: AVATAR_URL,
    location: { latitude: location.latitude, longitude: location.longitude },
    email: null,
    phone: null,
    expo_push_token: null,
    blocked_profiles: Array.isArray(rest.blocked_profiles) ? rest.blocked_profiles : [],
    created_at: now,
    updated_at: now,
  };
}

async function main() {
  console.log("🔍 Kugba profile fetch ho rahi hai...\n");

  let kugba: any;
  try {
    kugba = await getKugbaProfile();
  } catch (e: any) {
    console.error("❌", e?.message || e);
    process.exit(1);
  }

  const loc = kugba.location;
  const centerLat =
    typeof loc?.latitude === "number" ? loc.latitude : 33.6421515;
  const centerLon =
    typeof loc?.longitude === "number" ? loc.longitude : 73.0781827;

  console.log(
    `✅ Kugba mili: ${kugba.full_name} @ (${centerLat}, ${centerLon})\n`
  );
  console.log(
    `🌱 ${COUNT} dummy profiles (Kugba jaisi) create ho rahi hain...\n`
  );

  let created = 0;
  let failed = 0;

  for (let i = 0; i < COUNT; i++) {
    const fullName = DUMMY_NAMES[i] || `Dummy${i + 1}`;
    const email = `dummy.kugba.100km.${i + 1}@test.com`;
    const location = randomPointWithinRadius(centerLat, centerLon, RADIUS_KM);

    try {
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: "Test@1234",
          email_confirm: true,
        });

      if (authError) {
        if (
          authError.message?.includes("already") ||
          authError.message?.includes("registered")
        ) {
          console.log(`⏭️  ${email} – already exists, skip`);
          failed++;
          continue;
        }
        console.error(`❌ ${email}: ${authError.message}`);
        failed++;
        continue;
      }

      if (!authUser?.user?.id) {
        console.error(`❌ ${email}: No user id`);
        failed++;
        continue;
      }

      const row = buildDummyProfile(kugba, authUser.user.id, fullName, location);
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(row, { onConflict: "id" });

      if (profileError) {
        console.error(`❌ Profile ${email}: ${profileError.message}`);
        failed++;
        continue;
      }

      console.log(
        `✅ ${fullName} – (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
      );
      created++;
    } catch (e: any) {
      console.error(`❌ ${email}: ${e?.message || e}`);
      failed++;
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Failed/Skipped: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
