import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// GET /api/chats/:profileId
export const getChatsByProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: "Missing profileId" });
    }

    // 1️⃣ Fetch all conversations where this profile is either user1 or user2
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1.eq.${profileId},user2.eq.${profileId}`);

    if (convError) {
      return res.status(500).json({ error: convError.message });
    }

    if (!conversations || conversations.length === 0) {
      return res.status(200).json({ chats: [] });
    }

    // 2️⃣ For each conversation, fetch latest message and participant info
    const chats = await Promise.all(
      conversations.map(async (conv) => {
        // Determine the other participant
        const otherUserId = conv.user1 === profileId ? conv.user2 : conv.user1;

        // Fetch other participant details from profiles
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar")
          .eq("id", otherUserId)
          .maybeSingle();

        // Fetch latest message
        const { data: latestMessage } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          conversationId: conv.id,
          participant: otherProfile,
          latestMessage: latestMessage || null,
          updatedAt: conv.updated_at,
        };
      })
    );

    // 3️⃣ Sort chats by updatedAt descending (most recent first)
    chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({ chats });
  } catch (err: any) {
    console.error("Error fetching chats:", err);
    return res.status(500).json({ error: err.message });
  }
};
