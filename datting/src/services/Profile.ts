import { Request, Response } from "express";
import { supabase, getSupabaseAdmin } from "../config/supabase";

// ================= Helper: Distance Function =================
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ================= Main Controller =================
export async function getprofiles(req: Request, res: Response, userId?: string) {
console.log(req.body);

  try {
    if (!userId) return res.status(401).json({ error: "User ID missing" });

    const today = new Date();
    const page = Number(req.query.page) || 1;
    let requestLimit = Number(req.query.limit) || 10;

    // 1. FETCH LOGIN USER DATA
    let { data: loginUser, error: loginError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (loginError || !loginUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // 2. VIP EXPIRY CHECK
    if (loginUser.is_vip && loginUser.membership_expires_at) {
      const expiryDate = new Date(loginUser.membership_expires_at);
      if (today > expiryDate) {
        const { data: updatedUser } = await supabase
          .from("profiles")
          .update({ is_vip: false, member_ship_type: "free" })
          .eq("id", userId)
          .select().single();

        if (updatedUser) loginUser = updatedUser;
      }
    }
    
    

    // 3. SWIPE LIMIT LOGIC
    let swipesRemaining: number | string = "Unlimited";
    if (!loginUser.is_vip) {
      const lastReset = new Date(loginUser.last_like_reset || today);
      const diffInHours = (today.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      if (diffInHours >= 24) {
        const { data: resetUser } = await supabase
          .from("profiles")
          .update({ daily_swipes_count: 0, last_like_reset: today.toISOString() })
          .eq("id", userId)
          .select().single();
        if (resetUser) loginUser = resetUser;
        swipesRemaining = 10;
      } else {
        const currentCount = loginUser.daily_swipes_count || 0;
        swipesRemaining = Math.max(0, 10 - currentCount);

        if (swipesRemaining <= 0) {
          return res.status(200).json({ message: "Daily swipe limit reached.", data: [] });
        }
        requestLimit = Math.min(requestLimit, swipesRemaining as number);
      }
    }

    // 4. GET ALL EXCLUSIONS (Interactions, Matches, Reports, and Admin Blocks)
    const [interactions, m1, m2, reports, adminBlocked] = await Promise.all([
      supabase.from("user_interactions").select("to_user").eq("from_user", userId),
      supabase.from("matches").select("user2").eq("user1", userId),
      supabase.from("matches").select("user1").eq("user2", userId),
      supabase.from("reports").select("reported_id").eq("status", true),
      supabase.from("profiles").select("id").eq("adminblock", true)
    ]);

    const excludedIds = new Set<string>([userId]);
    
    // Interactions & Matches
    interactions.data?.forEach(i => excludedIds.add(i.to_user));
    m1.data?.forEach(m => excludedIds.add(m.user2));
    m2.data?.forEach(m => excludedIds.add(m.user1));
    
    // Reported Users
    reports.data?.forEach(r => excludedIds.add(r.reported_id));
    
    // Admin Blocked Users
    adminBlocked.data?.forEach(p => excludedIds.add(p.id));

    // Login user ki apni blocked list (sirf array ho to use karein)
    if (Array.isArray(loginUser.blocked_profiles)) {
      loginUser.blocked_profiles.forEach((id: string) => excludedIds.add(id));
    }

    // 5. DATABASE FILTERS (cetagory = user ki select ki hui category, frontend se aati hai)
    const { 
        genderFilter, minAge, maxAge, maxDistance, 
        professionFilter = [], userInterests = [],
        cetagory 
    } = req.body?.data || {};

    let query = supabase.from("profiles").select("*", { count: "exact" });
    // Apply All Exclusions at once (sirf valid string IDs)
    const finalExcludeArray = Array.from(excludedIds).filter((id): id is string => id != null && typeof id === "string");
    if (finalExcludeArray.length > 0) {
      query = query.not("id", "in", `(${finalExcludeArray.join(",")})`);
    }

    if (genderFilter) query = query.eq("gender", genderFilter);
    if (Array.isArray(professionFilter) && professionFilter.length > 0) query = query.in("profession", professionFilter);
    if (cetagory) query = query.eq("cetagory", cetagory);

    // DOB Logic
    if (maxAge) {
      const date = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
      query = query.gte("date_of_birth", date.toISOString().split("T")[0]);
    }
    if (minAge) {
      const date = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
      query = query.lte("date_of_birth", date.toISOString().split("T")[0]);
    }

    query = query.order("created_at", { ascending: false }); // Deterministic order
    const { data: profiles, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });


    // 6. GEOGRAPHIC & INTEREST FILTERING
    const userLat = Number(loginUser.location?.latitude);
    const userLon = Number(loginUser.location?.longitude);

    let filteredProfiles = (profiles || []).map((profile: any) => {
      if (!profile.location?.latitude || !profile.location?.longitude || !userLat || !userLon) {
        return { ...profile, distance_km: null };
      }
      const dist = getDistanceFromLatLonInKm(userLat, userLon, profile.location.latitude, profile.location.longitude);
      return { ...profile, distance_km: Number(dist.toFixed(2)) };
    });

    const hasUserLocation = userLat != null && userLon != null && !isNaN(userLat) && !isNaN(userLon);
    filteredProfiles = filteredProfiles.filter((p: any) => {
      // Jab user ka location na ho to distance filter mat lagao (sab dikhao)
      const matchesDistance = !hasUserLocation ? true : (maxDistance ? (p.distance_km != null && p.distance_km <= maxDistance) : true);
      // Interest match: case-insensitive (Sports / sports dono match)
      const userInterestsLower = (userInterests || []).map((x: string) => String(x).toLowerCase());
      const matchesInterests = userInterestsLower.length === 0
        ? true
        : (p.interests || []).some((i: string) => userInterestsLower.includes(String(i).toLowerCase()));
      return matchesDistance && matchesInterests;
    });

    // 7. MANUAL PAGINATION
    const from = (page - 1) * requestLimit;
    const paginatedData = filteredProfiles.slice(from, from + requestLimit);

    return res.status(200).json({
      metadata: {
        total_filtered: filteredProfiles.length,
        total_in_db: count,
        current_page: page,
        swipes_remaining: swipesRemaining,
        account_type: loginUser.is_vip ? "Premium" : "Free"
      },
      data: paginatedData,
    });

  } catch (err: any) {
    console.error("Critical Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ================= Update Profile Category =================
export async function updateProfileCategory(userId: string, cetagory: string) {
  if (!userId) throw new Error("User ID required");
  const { data, error } = await supabase
    .from("profiles")
    .update({ cetagory: cetagory })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ================= Update Expo Push Token (RLS bypass – service role) =================
export async function updateExpoPushToken(userId: string, expoPushToken: string | null) {
  if (!userId) throw new Error("User ID required");
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  const { error } = await admin
    .from("profiles")
    .update({ expo_push_token: expoPushToken })
    .eq("id", userId);
  if (error) throw error;
}