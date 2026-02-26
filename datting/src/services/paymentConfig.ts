import { supabase } from "../config/supabase";

export type PaymentRow = {
  id?: number;
  created_at?: string;
  key: string | null;
  url: string | null;
  publishable_key: string | null;
  webhook_secret: string | null;
  monime_token?: string | null;
  monime_space?: string | null;
  monime_spcae?: string | null;
  monime_webhook_secret?: string | null;
};

/**
 * payment table – Stripe columns only (Stripe code unchanged). Monime alag query se.
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

/** Monime – alag query (Stripe table/select touch nahi). Agar monime columns nahi to null. */
export async function getMonimeConfigFromDb(): Promise<{ token: string; spaceId: string } | null> {
  try {
    const { data, error } = await supabase
      .from("payment")
      .select("monime_token, monime_spcae")
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as { monime_token?: string | null; monime_spcae?: string | null };
    const token = row.monime_token?.trim();
    const spaceId = row.monime_spcae?.trim();
    if (!token || !spaceId) return null;
    return { token, spaceId };
  } catch {
    return null;
  }
}

export async function getMonimeWebhookSecretFromDb(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("payment")
      .select("monime_webhook_secret")
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { monime_webhook_secret?: string | null }).monime_webhook_secret?.trim() || null;
  } catch {
    return null;
  }
}

/** Monime checkout ke liye base URL – payment table url (Stripe wala) use karte hain */
export async function getPaymentBaseUrlFromDb(): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("payment").select("url").limit(1).maybeSingle();
    if (error || !data) return null;
    return (data as { url?: string | null }).url?.trim() || null;
  } catch {
    return null;
  }
}

const MONIME_WEBHOOK_FULL_URL = (() => {
  try {
    const apiUrl = (typeof globalThis !== "undefined" && (globalThis as any).process?.env?.API_URL) as string | undefined;
    return apiUrl?.trim() ? `${String(apiUrl).replace(/\/$/, "")}/api/v1/webhook-monime` : "https://api.kubsy.app/api/v1/webhook-monime";
  } catch {
    return "https://api.kubsy.app/api/v1/webhook-monime";
  }
})();

/**
 * GET /api/v1/payment-config – Public API (Stripe: publishableKey, url, configured – same as before)
 * Monime: monimeEnabled, monimeWebhookUrl – extra fields, Stripe unchanged
 */
export async function getPaymentConfigApi(_req: any, res: any) {
  try {
    const row = await getPaymentConfigFromDb();
    const publishableKey = row?.publishable_key?.trim() || null;
    const url = row?.url?.trim() || null;
    const monimeConfig = await getMonimeConfigFromDb();
    res.status(200).json({
      publishableKey,
      url,
      configured: !!publishableKey,
      monimeEnabled: !!monimeConfig,
      monimeWebhookUrl: MONIME_WEBHOOK_FULL_URL,
    });
  } catch (err) {
    console.error("getPaymentConfigApi:", err);
    res.status(500).json({ error: "Failed to get payment config" });
  }
}
