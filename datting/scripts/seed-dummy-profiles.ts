/**
 * Dummy profiles seed script – VPS / local par chalane ke liye
 * Pehle .env mein SUPABASE_URL aur SUPABASE_SERVICE_ROLE_KEY set karein
 *
 * Chalaane ka tareeqa:
 *   cd datting && npx ts-node scripts/seed-dummy-profiles.ts
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://supabase.kubsy.app";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY .env mein set karein (auth users banane ke liye zaroori)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Dummy profiles – schema ke mutabiq (id auth se aayega)
const DUMMY_USERS = [
  {
    email: "dummy1@test.com",
    password: "Test@1234",
    full_name: "Ayesha Khan",
    nickname: "Ayesha",
    gender: "female",
    date_of_birth: "1998-05-12",
    profession: "Doctor",
    about: "Love travel and coffee.",
    cetagory: "Casual dating",
    location: { latitude: 24.8607, longitude: 67.0011 },
    interests: ["travel", "music", "coffee"],
    images: ["https://picsum.photos/400/400?random=1"],
  },
  {
    email: "dummy2@test.com",
    password: "Test@1234",
    full_name: "Hassan Ali",
    nickname: "Hassan",
    gender: "male",
    date_of_birth: "1995-08-22",
    profession: "Engineer",
    about: "Tech enthusiast.",
    cetagory: "Casual dating",
    location: { latitude: 31.5204, longitude: 74.3587 },
    interests: ["tech", "cricket", "reading"],
    images: ["https://picsum.photos/400/400?random=2"],
  },
  {
    email: "dummy3@test.com",
    password: "Test@1234",
    full_name: "Sara Ahmed",
    nickname: "Sara",
    gender: "female",
    date_of_birth: "1999-01-08",
    profession: "Teacher",
    about: "Books and nature.",
    cetagory: "Casual dating",
    location: { latitude: 24.8949, longitude: 67.0302 },
    interests: ["reading", "nature", "yoga"],
    images: ["https://picsum.photos/400/400?random=3"],
  },
  {
    email: "dummy4@test.com",
    password: "Test@1234",
    full_name: "Omar Farooq",
    nickname: "Omar",
    gender: "male",
    date_of_birth: "1993-11-30",
    profession: "Business",
    about: "Entrepreneur.",
    cetagory: "Casual dating",
    location: { latitude: 31.4654, longitude: 74.3669 },
    interests: ["business", "fitness", "food"],
    images: ["https://picsum.photos/400/400?random=4"],
    is_vip: true,
    member_ship_type: "premium",
    membership_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    email: "dummy5@test.com",
    password: "Test@1234",
    full_name: "Zainab Malik",
    nickname: "Zainab",
    gender: "female",
    date_of_birth: "1997-03-15",
    profession: "Designer",
    about: "Creative soul.",
    cetagory: "Casual dating",
    location: { latitude: 24.9275, longitude: 67.0992 },
    interests: ["art", "design", "movies"],
    images: ["https://picsum.photos/400/400?random=5"],
  },
  {
    email: "dummy6@test.com",
    password: "Test@1234",
    full_name: "Bilal Hussain",
    nickname: "Bilal",
    gender: "male",
    date_of_birth: "1996-07-04",
    profession: "Developer",
    about: "Code and coffee.",
    cetagory: "Casual dating",
    location: { latitude: 24.8607, longitude: 67.0011 },
    interests: ["coding", "gaming", "music"],
    images: ["https://picsum.photos/400/400?random=6"],
  },
  {
    email: "dummy7@test.com",
    password: "Test@1234",
    full_name: "Fatima Noor",
    nickname: "Fatima",
    gender: "female",
    date_of_birth: "2000-09-20",
    profession: "Student",
    about: "Exploring life.",
    cetagory: "Casual dating",
    location: { latitude: 31.5497, longitude: 74.3436 },
    interests: ["photography", "travel", "food"],
    images: ["https://picsum.photos/400/400?random=7"],
  },
  {
    email: "dummy8@test.com",
    password: "Test@1234",
    full_name: "Usman Sheikh",
    nickname: "Usman",
    gender: "male",
    date_of_birth: "1994-12-01",
    profession: "Marketing",
    about: "Ideas and growth.",
    cetagory: "Casual dating",
    location: { latitude: 24.9056, longitude: 67.0822 },
    interests: ["marketing", "sports", "travel"],
    images: ["https://picsum.photos/400/400?random=8"],
  },
];

function profileRow(userId: string, d: (typeof DUMMY_USERS)[0]) {
  const now = new Date().toISOString();
  return {
    id: userId,
    full_name: d.full_name,
    nickname: d.nickname ?? null,
    date_of_birth: d.date_of_birth ?? null,
    gender: d.gender ?? null,
    avatar_url: (d as any).avatar_url ?? (d.images && d.images[0]) ?? null,
    location: d.location ?? null,
    email: d.email ?? null,
    phone: null,
    images: d.images ?? [],
    interests: d.interests ?? [],
    is_vip: (d as any).is_vip ?? false,
    daily_swipes_count: 0,
    about: d.about ?? null,
    profession: d.profession ?? null,
    expo_push_token: null,
    blocked_profiles: [],
    member_ship_type: (d as any).member_ship_type ?? "free",
    membership_expires_at: (d as any).membership_expires_at ?? null,
    last_like_reset: null,
    last_payment_id: null,
    cetagory: d.cetagory ?? "Casual dating",
    admin: null,
    adminblock: null,
    created_at: now,
    updated_at: now,
  };
}

async function main() {
  console.log("🌱 Dummy profiles seed start...\n");
  let created = 0;
  let skipped = 0;

  for (const d of DUMMY_USERS) {
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: d.email,
        password: d.password,
        email_confirm: true,
      });

      if (authError) {
        if (authError.message?.includes("already been registered") || authError.message?.includes("already exists")) {
          console.log(`⏭️  ${d.email} – pehle se maujood, profile update try...`);
          const { data: existing } = await supabase.auth.admin.listUsers();
          const user = existing?.users?.find((u: any) => u.email === d.email);
          if (user) {
            const { error: upError } = await supabase.from("profiles").upsert(profileRow(user.id, d), {
              onConflict: "id",
            });
            if (upError) console.log(`   ⚠️ Profile update error: ${upError.message}`);
            else console.log(`   ✅ Profile updated.`);
            skipped++;
          }
          continue;
        }
        console.error(`❌ ${d.email}: ${authError.message}`);
        continue;
      }

      if (!authUser?.user?.id) {
        console.error(`❌ ${d.email}: User create hua lekin id nahi mili`);
        continue;
      }

      const row = profileRow(authUser.user.id, d);
      const { error: profileError } = await supabase.from("profiles").upsert(row, { onConflict: "id" });

      if (profileError) {
        console.error(`❌ Profile insert ${d.email}: ${profileError.message}`);
        continue;
      }

      console.log(`✅ ${d.email} – user + profile created (${d.full_name})`);
      created++;
    } catch (e: any) {
      console.error(`❌ ${d.email}: ${e?.message || e}`);
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Skipped/Updated: ${skipped}`);
  console.log("\nLogin test ke liye koi bhi email use karein, password: Test@1234");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
