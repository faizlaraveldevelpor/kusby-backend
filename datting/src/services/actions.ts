import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const handleInteraction = async (req: Request, res: Response) => {
  
  try {
    const { loginUserId, currentUserId, type } = req.body as {
      loginUserId: string;
      currentUserId: string;
      type: string;
    };

    // Validation
    if (!loginUserId || !currentUserId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dbType = type.toLowerCase();

    // 1️⃣ User ka VIP Status aur Swipe Count check karein
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("is_vip, daily_swipes_count")
      .eq("id", loginUserId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // 2️⃣ Agar User VIP nahi hai to check karein limit khatam to nahi hui
    if (!userData.is_vip) {
      const SWIPE_LIMIT = 20; // Aap apni marzi ki limit rakh sakte hain

      if (userData.daily_swipes_count >= SWIPE_LIMIT) {
        return res.status(403).json({
          error: "Daily limit reached",
          message: "Upgrade to VIP for unlimited swipes!",
        });
      }

      // Non-VIP user ka count barhayein aur timestamp update karein
      await supabase
        .from("profiles")
        .update({
          daily_swipes_count: userData.daily_swipes_count + 1,
          last_like_reset: new Date().toISOString(),
        })
        .eq("id", loginUserId);
    }

    // 3️⃣ Check reverse interaction (Hasnat → Faiz) for potential match
    const { data: reverseInteraction } = await supabase
      .from("user_interactions")
      .select("*")
      .eq("from_user", currentUserId)
      .eq("to_user", loginUserId)
      .in("type", ["like", "superlike"])
      .maybeSingle();

    let isMatch = false;
    let interactionData;

    // 4️⃣ Match trigger logic
    if (reverseInteraction && ["like", "superlike"].includes(dbType)) {
      isMatch = true;

      // Update reverse row to set match = true
      await supabase
        .from("user_interactions")
        .update({ match: true })
        .eq("id", reverseInteraction.id);

      // Current interaction ko match = true ke saath insert/upsert karein
      const { data: inserted } = await supabase
        .from("user_interactions")
        .upsert({
          from_user: loginUserId,
          to_user: currentUserId,
          type: dbType,
          match: true,
        }, { onConflict: 'from_user,to_user' })
        .select()
        .single();
      
      interactionData = inserted;

      // 5️⃣ Matches & Conversations Table Handling
      const [userA, userB] = loginUserId < currentUserId 
        ? [loginUserId, currentUserId] 
        : [currentUserId, loginUserId];

      // Upsert into matches (prevents duplicates)
      await supabase
        .from("matches")
        .upsert({ user1: userA, user2: userB }, { onConflict: 'user1,user2' });

      // Upsert into conversations
      await supabase
        .from("conversations")
        .upsert({ user1: userA, user2: userB }, { onConflict: 'user1,user2' });

    } else {
      // 6️⃣ Normal Interaction (No match yet)
      const { data: inserted } = await supabase
        .from("user_interactions")
        .upsert({
          from_user: loginUserId,
          to_user: currentUserId,
          type: dbType,
          match: false,
        }, { onConflict: 'from_user,to_user' })
        .select()
        .single();

      interactionData = inserted;
    }

    // Success Response
    return res.status(200).json({
      message: isMatch ? "It's a match 🎉" : "Interaction saved successfully",
      interaction: interactionData,
      match: isMatch ? { user1: loginUserId, user2: currentUserId } : null,
      swipes_remaining: userData.is_vip ? "Unlimited" : (20 - (userData.daily_swipes_count + 1))
    });
        

  } catch (err: any) {
    console.error("Error in handleInteraction:", err);
    return res.status(500).json({ error: "Something went wrong internally" });
  }
};


export async function getPeopleWhoLikedMe(req: Request, res: Response) {
  try {
    // 1. Pagination Params (Default values: page 1, limit 10)
    const { userId, page = 1, limit = 10 } = req.body;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 2. Blocked profiles aur Matches fetch karein
    const { data: loginUser, error: userError } = await supabase
      .from("profiles")
      .select("blocked_profiles")
      .eq("id", userId)
      .single();

    if (userError || !loginUser) return res.status(401).json({ error: "User not found" });

    const [m1, m2] = await Promise.all([
      supabase.from("matches").select("user2").eq("user1", userId),
      supabase.from("matches").select("user1").eq("user2", userId),
    ]);

    // Sab excluded IDs ko ek array mein jama karein (sirf valid string UUIDs)
    const rawExcluded = [
      userId,
      ...(m1.data?.map(m => m.user2) || []),
      ...(m2.data?.map(m => m.user1) || []),
      ...(Array.isArray(loginUser.blocked_profiles) ? loginUser.blocked_profiles : [])
    ];
    const excludedIds = rawExcluded.filter((id): id is string => id != null && typeof id === "string");

    // 3. Query with Pagination & Database-level Filtering
    // PostgREST/Supabase: .not("col", "in", "(id1,id2)") - same as Profile.ts
    const excludedList = excludedIds.length ? `(${excludedIds.join(",")})` : "()";
    const { data: interactions, error: interactionError, count } = await supabase
      .from("user_interactions")
      .select(`
        from_user,
        type,
        profiles!user_interactions_from_user_fkey (
          id,
          full_name,
          avatar_url,
          location,
          profession,
          date_of_birth,
          is_vip
        )
      `, { count: "exact" }) // 'count' exact se total records milte hain
      .eq("to_user", userId)
      .in("type", ["like", "superlike"])
      .not("from_user", "in", excludedList) // DB level par filtering
      .order("created_at", { ascending: false }) // Newest likes first
      .range(from, to); // Pagination apply yahan ho rahi hai

    if (interactionError) {
      console.error("[getPeopleWhoLikedMe] Supabase error:", interactionError.message, interactionError);
      return res.status(400).json({ error: interactionError.message, code: interactionError.code });
    }

    // 4. Formatting data (profiles null ho to skip)
    const formattedData = (interactions ?? [])
      .filter(item => item.profiles != null)
      .map(item => ({
        ...(item.profiles as object),
        interaction_type: item.type
      }));

    // 5. Response with Metadata
    return res.status(200).json({
      metadata: {
        total_records: count,
        current_page: Number(page),
        total_pages: Math.ceil((count || 0) / limit),
        has_more: from + formattedData.length < (count || 0)
      },
      data: formattedData
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}