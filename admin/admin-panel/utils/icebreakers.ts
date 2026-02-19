import { supabase } from "@/config/supabase";


export async function getIcebreakers() {
  try {
    const { data, error } = await supabase
      .from('icebreakers')
      .select('message')
      .limit(1)
      .single();

    if (error) {
      // Agar row exist nahi karti (PGRST116), toh empty array bhej do
      if (error.code === 'PGRST116') return { success: true, messages: [] };
      throw error;
    }

    return { success: true, messages: data.message };
  } catch (error: any) {
    console.error("Error fetching icebreakers:", error.message);
    return { success: false, error: error.message, messages: [] };
  }
}
export async function updateIcebreakers( messages: string[]) {
    console.log(messages);
    
  try {
    // .upsert use karne se agar ID 1 ki row nahi hogi toh ban jayegi
    // Agar hogi toh 'message' array update ho jayegi
    const { data, error } = await supabase
      .from('icebreakers')
      .upsert({ 
        id: "4d4dbde8-ba8f-4dcf-957d-5897890c3d13", 
        message: messages 
      }, { onConflict: 'id' }) 
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Update Error:", error.message);
    return { success: false, error: error.message };
  }
}