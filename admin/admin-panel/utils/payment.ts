import { supabase } from "@/config/supabase";

export type PaymentConfig = {
  id?: number;
  created_at?: string;
  key: string | null;
  url: string | null;
  publishable_key: string | null;
  webhook_secret: string | null;
};

export async function getPaymentConfig(): Promise<{
  success: boolean;
  data?: PaymentConfig;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("payment")
      .select("id, created_at, key, url, publishable_key, webhook_secret")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data ?? { key: null, url: null, publishable_key: null, webhook_secret: null } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("getPaymentConfig:", message);
    return { success: false, error: message };
  }
}

export async function updatePaymentConfig(updates: {
  key?: string | null;
  url?: string | null;
  publishable_key?: string | null;
  webhook_secret?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from("payment")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("payment")
        .update({
          key: updates.key ?? undefined,
          url: updates.url ?? undefined,
          publishable_key: updates.publishable_key ?? undefined,
          webhook_secret: updates.webhook_secret ?? undefined,
        })
        .eq("id", existing.id);

      if (error) throw error;
      return { success: true };
    }

    const { error: insertError } = await supabase.from("payment").insert({
      key: updates.key ?? null,
      url: updates.url ?? null,
      publishable_key: updates.publishable_key ?? null,
      webhook_secret: updates.webhook_secret ?? null,
    });

    if (insertError) throw insertError;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("updatePaymentConfig:", message);
    return { success: false, error: message };
  }
}
