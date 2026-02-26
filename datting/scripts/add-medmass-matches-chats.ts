/**
 * Med Mass ko 50 dummy users ke sath matches + conversations (chat) mein add karo.
 * user_interactions bhi set (dono taraf like, match=true) taake match/chat list sahi dikhe.
 * Run: cd kubsy/datting && npx ts-node scripts/add-medmass-matches-chats.ts
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

async function getMedMassId(): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("full_name", "%med mass%")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Med Mass fetch: ${error.message}`);
  if (!data) throw new Error("Med Mass profile nahi mili.");
  return data.id;
}

function getDummyIds(): string[] {
  const jsonPath = path.join(__dirname, "../medmass-dummy-profiles.json");
  if (!fs.existsSync(jsonPath)) throw new Error("medmass-dummy-profiles.json nahi mili. Pehle get-medmass-dummy-profiles.ts chalao.");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error("Invalid JSON: array chahiye");
  return arr.map((p: any) => p.id).filter(Boolean);
}

async function main() {
  console.log("🔍 Med Mass ID aur dummy IDs load ho rahi hain...\n");

  const medMassId = await getMedMassId();
  const dummyIds = getDummyIds();
  console.log(`✅ Med Mass: ${medMassId}`);
  console.log(`✅ Dummy profiles: ${dummyIds.length}\n`);
  console.log("📌 Matches + Conversations + user_interactions add ho rahi hain...\n");

  let matchesOk = 0;
  let convOk = 0;
  let errCount = 0;

  for (const dummyId of dummyIds) {
    const [userA, userB] = medMassId < dummyId ? [medMassId, dummyId] : [dummyId, medMassId];

    try {
      const { error: matchErr } = await supabase
        .from("matches")
        .upsert({ user1: userA, user2: userB }, { onConflict: "user1,user2" });
      if (matchErr) {
        console.error(`  ❌ match ${dummyId}: ${matchErr.message}`);
        errCount++;
      } else matchesOk++;

      const { error: convErr } = await supabase
        .from("conversations")
        .upsert({ user1: userA, user2: userB }, { onConflict: "user1,user2" });
      if (convErr) {
        console.error(`  ❌ conversation ${dummyId}: ${convErr.message}`);
        errCount++;
      } else convOk++;

      await supabase
        .from("user_interactions")
        .upsert(
          { from_user: medMassId, to_user: dummyId, type: "like", match: true },
          { onConflict: "from_user,to_user" }
        );
      await supabase
        .from("user_interactions")
        .upsert(
          { from_user: dummyId, to_user: medMassId, type: "like", match: true },
          { onConflict: "from_user,to_user" }
        );
    } catch (e: any) {
      console.error(`  ❌ ${dummyId}: ${e?.message || e}`);
      errCount++;
    }
  }

  console.log(`\n✅ Done. Matches: ${matchesOk}, Conversations: ${convOk}, Errors: ${errCount}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
