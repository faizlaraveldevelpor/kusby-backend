/**
 * Seed 50 dummy profiles within 100 km of Faa's location
 * Fields match Faa profile; only full_name and location vary.
 * Run: cd datting && SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node scripts/seed-faa-area-profiles.ts
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://supabase.kubsy.app";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY set karein");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CENTER_LAT = 33.6420761;
const CENTER_LON = 73.0781543;
const RADIUS_KM = 100;
const COUNT = 50;

// Faa profile base – same images/interests/category etc.
const FAA_IMAGES = [
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1769549325831-0656b8u3ioor.jpeg",
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1769549325837-el8x8dqpo5q.jpeg",
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1769549325837-8p4m897gkhi.jpeg",
  "https://uaadkdoulbvlbixanfim.supabase.co/storage/v1/object/public/user/uploads/1769549325838-2xagrl8rjd9.jpeg",
];
const FAA_INTERESTS = ["Music", "Sports", "Travel", "Movies", "Food", "Fitness"];

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
  "Aisha", "Bushra", "Hira", "Zara", "Sana", "Mariam", "Fatima", "Ayesha", "Sara", "Zainab",
  "Hania", "Maham", "Anaya", "Iqra", "Dania", "Rida", "Huda", "Noor", "Layla", "Yusra",
  "Aiza", "Minahil", "Zoya", "Hareem", "Alina", "Eman", "Fizza", "Hadiya", "Inaya", "Jannat",
  "Kiran", "Lubna", "Mahnoor", "Nadia", "Omaima", "Parisa", "Qirat", "Rumaisa", "Saba", "Tahira",
  "Umaima", "Vania", "Wania", "Yasmin", "Zara", "Amna", "Bisma", "Hafsa", "Iman", "Javeria",
];

function profileRow(
  userId: string,
  fullName: string,
  location: { latitude: number; longitude: number }
) {
  const now = new Date().toISOString();
  return {
    id: userId,
    full_name: fullName,
    nickname: null,
    date_of_birth: "1996-02-20",
    gender: "Female",
    avatar_url: null,
    location: { latitude: location.latitude, longitude: location.longitude },
    email: null,
    phone: null,
    images: FAA_IMAGES,
    interests: FAA_INTERESTS,
    is_vip: true,
    daily_swipes_count: 0,
    about: "Cgfgcfgc",
    profession: "Developer",
    expo_push_token: null,
    blocked_profiles: [],
    member_ship_type: "free",
    membership_expires_at: null,
    last_like_reset: null,
    last_payment_id: null,
    cetagory: "Hookups",
    admin: null,
    adminblock: null,
    created_at: now,
    updated_at: now,
  };
}

async function main() {
  console.log(
    `🌱 Seeding ${COUNT} dummy profiles (Faa-style) within ${RADIUS_KM} km of (${CENTER_LAT}, ${CENTER_LON})...\n`
  );
  let created = 0;
  let failed = 0;

  for (let i = 0; i < COUNT; i++) {
    const fullName = DUMMY_NAMES[i] || `DummyF${i + 1}`;
    const email = `dummy.faa.${i + 1}@test.com`;
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

      const row = profileRow(authUser.user.id, fullName, location);
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
