import { supabase } from "@/config/supabase";


/**
 * Step 1: Check if admin exists and send OTP
 */
export async function handleAdminLogin(phoneNumber: string) {
    console.log(phoneNumber);
    
  try {
    // 1. Database mein check karein ke ye number admin hai ya nahi
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('admin')
      .eq('phone',phoneNumber )
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Access Denied: Number not found in admin list." };
    }

    if (!profile.admin) {
      return { success: false, error: "Access Denied: You do not have admin privileges." };
    }

    // 2. Agar admin hai, toh Supabase ke built-in OTP function ko call karein
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (otpError) throw otpError;

    return { success: true, message: "OTP sent successfully!" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Step 2: Verify the OTP code
 */
export async function verifyAdminOtp(phoneNumber: string, token: string) {
    console.log(phoneNumber);
    
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: token,
      type: 'sms',
    });
console.log(data);

    if (error) throw error;

    return { success: true, session: data.session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}