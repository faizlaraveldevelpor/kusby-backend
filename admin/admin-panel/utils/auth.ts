import { supabase } from "@/config/supabase";


/**
 * Step 1: Check if admin exists and send OTP
 */
export async function handleAdminLogin(phoneNumber: string) {
  try {
    // Normalize: +923001234567 and 03001234567 dono se match
    const localFormat = phoneNumber.startsWith("+92")
      ? "0" + phoneNumber.slice(3)
      : phoneNumber;
    const intlFormat = phoneNumber.startsWith("+") ? phoneNumber : "+92" + phoneNumber.replace(/^0/, "");

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("admin")
      .or(`phone.eq.${intlFormat},phone.eq.${localFormat}`)
      .limit(10);

    if (profileError) {
      return { success: false, error: "Profile check failed: " + (profileError.message || "Unknown error") };
    }
    if (!profiles || profiles.length === 0) {
      return { success: false, error: "Access Denied: Number not found in admin list." };
    }

    const isAdmin = profiles.some((p) => p.admin === true);
    if (!isAdmin) {
      return { success: false, error: "Access Denied: You do not have admin privileges." };
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: intlFormat,
    });

    if (otpError) {
      return { success: false, error: otpError.message || "Failed to send OTP. Check SMS config." };
    }

    return { success: true, message: "OTP sent successfully!" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return { success: false, error: msg };
  }
}

/**
 * Step 2: Verify the OTP code
 */
export async function verifyAdminOtp(phoneNumber: string, token: string) {
  try {
    const phone = phoneNumber.startsWith("+") ? phoneNumber : "+92" + phoneNumber.replace(/^0/, "");
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      return { success: false, error: error.message };
    }
    if (!data?.session) {
      return { success: false, error: "No session received." };
    }

    return { success: true, session: data.session };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    return { success: false, error: msg };
  }
}