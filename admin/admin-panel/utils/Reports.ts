import { supabase } from "@/config/supabase";

/**
 * getReports: 
 * 1. Reports fetch karta hai.
 * 2. Conversations table mein user1 aur user2 ki matching karta hai.
 * 3. Messages table se latest chat history nikalta hai.
 */
export const getReports = async (page: number = 0, pageSize: number = 10) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  try {
    // STEP 1: Pehle Reports fetch karein aur Profiles join karein
    const { data: reports, error: reportError, count } = await supabase
      .from("reports")
      .select(`
        *,
        reported_user:profiles!reported_id (id, full_name, avatar_url, phone),
        reporter:profiles!reporter_id (id, full_name)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (reportError) throw reportError;
    if (!reports || reports.length === 0) {
      return { data: [], totalCount: 0, currentPage: page, totalPages: 0 };
    }

    // STEP 2: Har report ke liye matching Conversation aur Messages fetch karein
    const reportsWithMessages = await Promise.all(
      reports.map(async (report) => {
        try {
          // Reporter aur Reported IDs
          const p1 = report.reporter_id;
          const p2 = report.reported_id;

          // Conversations table mein dono users ko find karein (order matter nahi karta)
          const { data: conv, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .or(`and(user1_id.eq.${p1},user2_id.eq.${p2}),and(user1_id.eq.${p2},user2_id.eq.${p1})`)
            .maybeSingle();

          if (convError) {
            console.warn(`Conversation fetch error for report ${report.id}:`, convError.message);
          }
console.log(conv);

          // Agar conversation ID mil jaye, toh uske messages le kar aayein
          if (conv?.id) {
            const { data: messages, error: msgError } = await supabase
              .from("messages")
              .select("id, content, sender_id, created_at")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (msgError) {
              console.error(`Messages error for report ${report.id}:`, msgError.message);
            }

            return {
              ...report,
              conversation_id: conv.id,
              chat_history: messages ? messages.reverse() : [] // Reverse taaki UI mein sequence sahi ho
            };
          }

          // Case: Koi chat history nahi mili
          return { ...report, chat_history: [] };

        } catch (innerError) {
          console.error("Inner processing error:", innerError);
          return { ...report, chat_history: [] };
        }
      })
    );

    return {
      data: reportsWithMessages,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize)
    };

  } catch (error) {
    console.error("Critical API Error:", error);
    return { data: [], totalCount: 0, currentPage: page, totalPages: 0 };
  }
};



export const getSingleReportDetails = async (reportId: string) => {
  try {
    // 1. Pehle Report aur dono Users ki basic info fetch karein
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select(`
        *,
        reported_user:profiles!reported_id (id, full_name, avatar_url, phone),
        reporter:profiles!reporter_id (id, full_name)
      `)
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      console.error("Report Fetch Error:", reportError);
      return null;
    }

    const p1 = report.reporter_id;
    const p2 = report.reported_id;

    // 2. Conversation table mein match dhoondna (Columns: user1, user2)
    // Logic: (user1=A AND user2=B) OR (user1=B AND user2=A)
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(user1.eq.${p1},user2.eq.${p2}),and(user1.eq.${p2},user2.eq.${p1})`)
      .maybeSingle();

    if (convErr) console.error("Conv Error:", convErr.message);

    let chatHistory = [];

    // 3. Agar conversation mil jaye toh messages fetch karein
    if (conv?.id) {
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!msgError && messages) {
        chatHistory = messages.reverse();
      }
    }

    return { ...report, chat_history: chatHistory };
  } catch (error) {
    console.error("Critical Error:", error);
    return null;
  }
};



/**
 * Case 1: Sirf Report Resolve karni hai (No Ban)
 * Rule: status = false, solve = true
 */
export const resolveReportOnly = async (reportId: string) => {
  try {
    const { error } = await supabase
      .from("reports")
      .update({ 
        solve: true,
        status: false // User ko block nahi karna
      })
      .eq("id", reportId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Case 2: User ko Ban karna hai aur Report Resolve karni hai
 * Rule: status = true, solve = true
 */
export const banUserAndResolve = async (reportId: string) => {
  try {
    const { error } = await supabase
      .from("reports")
      .update({ 
        status: true, // User block ho gaya
        solve: true   // Report solve ho gayi
      })
      .eq("id", reportId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};