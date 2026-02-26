/**
 * Monime.io payment – Stripe code bilkul change nahi hota.
 * Token/space payment table se (monime_token, monime_space). Webhook: monime_webhook_secret.
 */
import crypto from "crypto";
import { Request, Response } from "express";
import { getMonimeWebhookSecretFromDb } from "./paymentConfig";
import { supabase } from "../config/supabase";

const MONIME_API = "https://api.monime.io";
const MONIME_VERSION = "caph-2025-08-23";
const WEBHOOK_SIGNATURE_HEADER = "monime-signature";
const WEBHOOK_MAX_AGE_SEC = 5 * 60;

export type MonimeConfig = { token: string; spaceId: string };

export type CreateMonimeCheckoutParams = {
  amount: number;
  currency?: string;
  userId: string;
  successUrl: string;
  cancelUrl?: string;
  name?: string;
};

export async function createMonimeCheckout(
  params: CreateMonimeCheckoutParams,
  config: MonimeConfig
): Promise<{ checkoutUrl: string } | { error: string }> {
  if (!config?.token?.trim() || !config?.spaceId?.trim()) {
    return { error: "Monime not configured (payment table: monime_token, monime_space)" };
  }
  const token = config.token.trim();
  const spaceId = config.spaceId.trim();

  const { amount, currency = "usd", userId, successUrl, cancelUrl, name = "Kubsy VIP" } = params;
  const idempotencyKey = `kubsy-${userId}-${Date.now()}`;

  const body = {
    name: name,
    line_items: [
      {
        name: "Kubsy VIP Premium",
        quantity: 1,
        unit_amount: amount,
        currency,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl || successUrl,
    metadata: { userId },
  };

  try {
    const res = await fetch(`${MONIME_API}/v1/checkout-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Monime-Space-Id": spaceId,
        "Idempotency-Key": idempotencyKey,
        "Monime-Version": MONIME_VERSION,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || data?.error || `Monime API ${res.status}`;
      return { error: msg };
    }

    const checkoutUrl = data.url ?? data.checkout_url ?? data.checkoutUrl;
    if (!checkoutUrl || typeof checkoutUrl !== "string") {
      return { error: "Monime did not return checkout URL" };
    }
    return { checkoutUrl };
  } catch (err: any) {
    return { error: err?.message || "Monime request failed" };
  }
}

export function verifyMonimeWebhookSignature(rawBody: Buffer, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.trim().split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(t, 10);
  if (Number.isNaN(age) || age < -60 || age > WEBHOOK_MAX_AGE_SEC) return false;
  const payload = `${t}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const received = Buffer.from(v1, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (received.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(received, expectedBuf);
}

export async function monimeWebhookHandler(req: Request, res: Response): Promise<void> {
  try {
    const rawBody = req.body;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const secret = await getMonimeWebhookSecretFromDb();
    if (!secret) {
      res.status(503).json({ error: "Monime webhook secret not configured (payment.monime_webhook_secret)" });
      return;
    }
    const sigHeader =
      (req.headers[WEBHOOK_SIGNATURE_HEADER] as string) ||
      (req.headers["Monime-Signature"] as string) ||
      (req.headers["monite-signature"] as string);
    if (!sigHeader) {
      res.status(400).json({ error: "Missing Monime-Signature header" });
      return;
    }
    if (!verifyMonimeWebhookSignature(rawBody, sigHeader, secret)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }
    const payload = JSON.parse(rawBody.toString("utf8"));
    const result = await handleMonimeWebhook(payload, supabase);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("monimeWebhookHandler:", err);
    res.status(500).json({ error: err?.message || "Webhook failed" });
  }
}

export async function handleMonimeWebhook(payload: any, supabaseClient: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const userId = payload?.metadata?.userId ?? payload?.data?.metadata?.userId ?? payload?.userId;
    if (!userId) {
      return { ok: false, error: "No userId in webhook payload" };
    }
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        is_vip: true,
        member_ship_type: "premium",
        membership_expires_at: expiry.toISOString(),
        last_payment_id: payload?.id ?? payload?.data?.id ?? "monime",
      })
      .eq("id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}
