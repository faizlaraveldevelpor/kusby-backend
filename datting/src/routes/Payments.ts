import { Router, Request, Response } from "express";
import { payments, cancelSubscription } from "../services/payments";
import { getPaymentConfigApi } from "../services/paymentConfig";
import { createMonimeCheckout } from "../services/monime";
import { getMonimeConfigFromDb, getPaymentBaseUrlFromDb } from "../services/paymentConfig";

const Payments = Router();

// Public API: app isse publishable key le sakti hai (DB se) – Stripe, unchanged
Payments.get("/payment-config", getPaymentConfigApi);

Payments.post("/create-payment-intent", payments);
Payments.post("/cancel-subscription", cancelSubscription);

// Monime – naya route, Stripe code touch nahi
Payments.post("/create-monime-checkout", async (req: Request, res: Response) => {
  try {
    const monimeConfig = await getMonimeConfigFromDb();
    if (!monimeConfig) {
      return res.status(400).json({ error: "Monime not configured (payment table: monime_token, monime_space)" });
    }
    const { amount, userId, successUrl, cancelUrl } = req.body;
    if (!amount || !userId) {
      return res.status(400).json({ error: "amount and userId required" });
    }
    const baseUrl = (await getPaymentBaseUrlFromDb()) || process.env.APP_URL || "https://vps.kubsy.app";
    const result = await createMonimeCheckout(
      {
        amount: Number(amount),
        userId,
        successUrl: successUrl || `${baseUrl}/payment-success?userId=${encodeURIComponent(userId)}`,
        cancelUrl: cancelUrl || baseUrl,
        name: "Kubsy VIP",
      },
      monimeConfig
    );
    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ checkoutUrl: result.checkoutUrl });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Monime checkout failed" });
  }
});

export default Payments;