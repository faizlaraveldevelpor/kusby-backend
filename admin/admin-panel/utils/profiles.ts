import { supabase } from "@/config/supabase";

export const getProfilesCount = async () => {
  // 'count: exact' use karne se total rows ka number milta hai
  // .select('*', { count: 'exact', head: true }) 
  // 'head: true' ka matlab hai data nahi chahiye, sirf count chahiye
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching count:', error);
    return 0;
  }

  console.log('Total Profiles Count:', count);
  return count;
};

export const getRecentProfilesCount = async () => {
  // Aaj se 30 din pehle ki date calculate karein
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isoDate = thirtyDaysAgo.toISOString();

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', isoDate); // Jo profiles 30 din ke andar bani hain

  if (error) {
    console.error('Error fetching recent profiles:', error);
    return 0;
  }

  return count;
};
export const getDailyStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isoDate = thirtyDaysAgo.toISOString();

  // 1. Fetch Profiles Created At
  const { data: profiles } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', isoDate);

  // 2. Fetch Matches Created At
  const { data: matches } = await supabase
    .from('matches')
    .select('created_at')
    .gte('created_at', isoDate);

  // Data ko process karke daily counts mein badlein
  const statsMap = {};

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    statsMap[dateStr] = { date: dateStr.split('-').slice(1).join('/'), profiles: 0, matches: 0 };
  }

  profiles?.forEach(p => {
    const date = p.created_at.split('T')[0];
    if (statsMap[date]) statsMap[date].profiles++;
  });

  matches?.forEach(m => {
    const date = m.created_at.split('T')[0];
    if (statsMap[date]) statsMap[date].matches++;
  });

  return Object.values(statsMap);
};
export const getAllProfiles = async (page = 1, pageSize = 10, filters = {}) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  // Filters logic
  if (filters.name) {
    query = query.ilike('full_name', `%${filters.name}%`);
  }
  if (filters.gender && filters.gender !== 'all') {
    query = query.eq('gender', filters.gender);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count };
};

/**
 * Toggle Admin Status
 * @param {string} userId - User ki unique ID
 */
export const toggleAdminStatus = async (userId) => {
  try {
    // 1. Pehle current admin status fetch karein
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('admin')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Status ko flip karein (true hai to false, false hai to true)
    const newStatus = !profile.admin;

    // 3. Database mein update karein
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ admin: newStatus })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { data, error: null };
  } catch (error) {
    console.error('Error toggling admin role:', error.message);
    return { data: null, error };
  }
};
/**
 * Toggle Block Status
 * @param {string} userId - User ki ID
 */
export const toggleUserBlock = async (userId) => {
  try {
    // 1. Current status fetch karein (adminblock column)
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('adminblock')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Status flip karein
    const newBlockStatus = !profile.adminblock;

    // 3. Update karein
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ adminblock: newBlockStatus })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { data, error: null };
  } catch (error) {
    console.error('Error toggling block status:', error.message);
    return { data: null, error };
  }
};