/**
 * Pehle Med Mass profile get karo (self-hosted Supabase), phir usi jaisi 50 dummy profiles
 * create karo – center (8.4870803, -13.2354918), avatar_url fixed.
 * Run: cd kubsy/datting && npx ts-node scripts/seed-medmass-area-profiles.ts [startIndex]
 * startIndex=1 (default) → 1–50; 51 → 51–100 (50 more).
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

const CENTER_LAT = 8.4870803;
const CENTER_LON = -13.2354918;
const RADIUS_KM = 50;
const COUNT = 50;
const START_INDEX = parseInt(process.argv[2] || "1", 10) || 1;
const AVATAR_URL =
  "https://supabase.kubsy.app/storage/v1/object/public/user/uploads/1771949537864-jtsuh7rpyn.jpeg";

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

const DUMMY_NAMES = [
  "Adam", "Ben", "Chris", "David", "Ethan", "Frank", "George", "Henry", "Ivan", "Jack",
  "Kevin", "Leo", "Mark", "Neil", "Oscar", "Paul", "Quinn", "Ryan", "Sam", "Tom",
  "Victor", "Will", "Xavier", "Yuri", "Zack", "Alex", "Blake", "Cody", "Drew", "Evan",
  "Felix", "Gabe", "Hugo", "Ian", "Jake", "Kyle", "Luke", "Max", "Noah", "Owen",
  "Pete", "Reed", "Sean", "Troy", "Vince", "Wade", "Zane", "Aiden", "Brody", "Cole",
];

async function getMedMassProfile(): Promise<any> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("full_name", "%med mass%")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Med Mass fetch error: ${error.message}`);
  if (!data) throw new Error("Med Mass profile nahi mili.");
  return data;
}

function buildDummyProfile(
  template: any,
  userId: string,
  fullName: string,
  location: { latitude: number; longitude: number }
) {
  const now = new Date().toISOString();
  const { id, full_name, created_at, updated_at, ...rest } = template;
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
  console.log("🔍 Med Mass profile fetch ho rahi hai (self-hosted Supabase)...\n");

  let medMass: any;
  try {
    medMass = await getMedMassProfile();
  } catch (e: any) {
    console.error("❌", e?.message || e);
    process.exit(1);
  }

  console.log(`✅ Med Mass mili: ${medMass.full_name}\n`);
  console.log(
    `🌱 ${COUNT} dummy profiles (Med Mass jaisi) @ (${CENTER_LAT}, ${CENTER_LON}) ±${RADIUS_KM}km [emails ${START_INDEX}–${START_INDEX + COUNT - 1}]...\n`
  );

  let created = 0;
  let failed = 0;

  for (let i = 0; i < COUNT; i++) {
    const fullName = DUMMY_NAMES[i % DUMMY_NAMES.length] || `Dummy${START_INDEX + i}`;
    const email = `dummy.medmass.${START_INDEX + i}@test.com`;
    const location = randomPointWithinRadius(CENTER_LAT, CENTER_LON, RADIUS_KM);

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

      const row = buildDummyProfile(medMass, authUser.user.id, fullName, location);
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
