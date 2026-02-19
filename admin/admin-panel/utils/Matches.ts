import { supabase } from "@/config/supabase";

export const getRecentMatchesCount = async () => {
  // Aaj se 30 din pehle ki date calculate karein
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const isoDate = thirtyDaysAgo.toISOString();

  const { count, error } = await supabase
    .from('matches') 
    .select('*', { count: 'exact', head: true })
    .gte('created_at', isoDate); // Sirf wo records jo 30 din puray hain ya naye

  if (error) {
    console.error('Error fetching matches count:', error);
    return 0;
  }

  return count;
};


// Matches.js mein thodi tabdeeli
export const getAllMatches = async (page = 1, pageSize = 10, searchTerm = "") => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('matches')
    .select(`
      id, created_at,
      user_1:user1(full_name, avatar_url),
      user_2:user2(full_name, avatar_url)
    `, { count: 'exact' });

  // Agar search term hai toh filter apply karein
  if (searchTerm) {
    // Ye query tabhi kaam karegi agar search logic complex na ho
    // Warna client side filtering (niche wala code) best hai
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, count, error };
};