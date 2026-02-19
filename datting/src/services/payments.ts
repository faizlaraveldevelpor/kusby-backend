import Stripe from "stripe";
import { Request, Response } from "express";
import { stripe } from "../config/Stripe";
import { supabase } from "../config/supabase";
import { getPaymentConfigFromDb } from "./paymentConfig";

async function getStripeInstance(): Promise<Stripe | null> {
  const row = await getPaymentConfigFromDb();
  const fromDb = row?.key?.trim();
  if (fromDb && (fromDb.startsWith("sk_test_") || fromDb.startsWith("sk_live_"))) {
    return new Stripe(fromDb);
  }
  return stripe;
}

async function getWebhookSecret(): Promise<string | null> {
  const row = await getPaymentConfigFromDb();
  const fromDb = row?.webhook_secret?.trim();
  if (fromDb && fromDb.startsWith("whsec_")) return fromDb;
  return (process.env.STRIPE_WEBHOOK_SECRET || "").trim() || null;
}

export const webhooks = async (req: Request, res: Response) => {
  const webhookSecret = await getWebhookSecret();
  if (!webhookSecret) {
    console.log("❌ Webhook secret not found (DB or STRIPE_WEBHOOK_SECRET)");
    return res.status(503).json({ error: "Webhook secret not configured" });
  }

  const stripeInstance = await getStripeInstance();
  if (!stripeInstance) {
    return res.status(503).json({ error: "Payments not configured (DB key or .env)" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.log(`❌ Webhook Error: ${errMsg}`);
    return res.status(400).send(`Webhook Error: ${errMsg}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.userId;

    if (userId) {
      // ✅ 1. Pehle date object banayein
      let expiryDate = new Date();
      // ✅ 2. Mahina update karein
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_vip: true, 
          last_payment_id: paymentIntent.id,
          member_ship_type: "premium",
          // ✅ 3. Ab isse ISO string mein convert karke bhejye
          membership_expires_at: expiryDate.toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.log('❌ DB Update Error:', error);
      } else {
        console.log('🚀 User upgraded to Premium in DB!');
      }
    }
  }

  res.json({ received: true });
};
export const payments = async (req: Request, res: Response) => {
  const stripeInstance = await getStripeInstance();
  if (!stripeInstance) {
    return res.status(503).json({ error: "Payments not configured (DB key or .env)" });
  }
  console.log(req.body);
  const { amount, userId } = req.body;
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { userId: userId }, // Ye metadata webhook mein wapis milega
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errMsg });
  }
};

export const cancelSubscription = async (req: any, res: any) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  try {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        is_vip: false,
        member_ship_type: 'free',
        membership_expires_at: null,
        last_payment_id: null
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.log('❌ Cancel Subscription Error:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log('✅ Subscription cancelled for user:', userId);
    res.status(200).json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.log('❌ Cancel Subscription Error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
};