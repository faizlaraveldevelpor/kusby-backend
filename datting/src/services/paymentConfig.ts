import { supabase } from "../config/supabase";

export type PaymentRow = {
  id?: number;
  created_at?: string;
  key: string | null;
  url: string | null;
  publishable_key: string | null;
  webhook_secret: string | null;
};

/**
 * payment table structure: id, created_at, key, url, publishable_key, webhook_secret
 */
export async function getPaymentConfigFromDb(): Promise<PaymentRow | null> {
  try {
    const { data, error } = await supabase
      .from("payment")
      .select("id, created_at, key, url, publishable_key, webhook_secret")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("getPaymentConfigFromDb:", error.message);
      return null;
    }
    return data as PaymentRow | null;
  } catch (err) {
    console.error("getPaymentConfigFromDb:", err);
    return null;
  }
}

/**
 * GET /api/v1/payment-config – Public API
 * App ke liye: publishableKey, url (secret key / webhook kabhi nahi bhejte)
 */
export async function getPaymentConfigApi(_req: any, res: any) {
  try {
    const row = await getPaymentConfigFromDb();
    const publishableKey = row?.publishable_key?.trim() || null;
    const url = row?.url?.trim() || null;
    res.status(200).json({
      publishableKey,
      url,
      configured: !!publishableKey,
    });
  } catch (err) {
    console.error("getPaymentConfigApi:", err);
    res.status(500).json({ error: "Failed to get payment config" });
  }
}
