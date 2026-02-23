const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface ExpoPushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string | number>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

/**
 * Expo push token validate karta hai (ExponentPushToken[...] format)
 */
export function isValidExpoPushToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  return token.startsWith("ExponentPushToken");
}

/**
 * Expo Push API ko ek notification bhejta hai.
 * Fail hone par log karta hai, response block nahi karta.
 */
export async function sendExpoPush(payload: ExpoPushPayload): Promise<void> {
  if (!isValidExpoPushToken(payload.to)) {
    console.warn("[Push] Invalid or missing Expo push token, skip send");
    return;
  }

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: payload.to,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: payload.sound ?? "default",
        priority: payload.priority ?? "high",
        channelId: payload.channelId ?? "default",
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      data?: Array<{ status?: string; message?: string }>;
    };

    if (json?.data?.[0]?.status === "error") {
      console.warn("[Push] Expo error:", json.data[0].message);
    }
  } catch (err) {
    console.error("[Push] Send failed:", err);
  }
}
