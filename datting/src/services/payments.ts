import { stripe } from "../config/Stripe";
import { supabase } from "../config/supabase";


// 1. function ko async banayein
export const webhooks = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payments not configured. Add STRIPE_SECRET_KEY to .env' });
  }
  const sig = req.headers['stripe-signature'];
  const endpointSecret="whsec_84b9f60f123ab848eae178d4d20b214f1e982b81686c69f9ad2d1db0cf1c47c0"; 

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
export const payments=async(req,res)=>{
  if (!stripe) {
    return res.status(503).json({ error: 'Payments not configured. Add STRIPE_SECRET_KEY to .env' });
  }
  console.log(req.body);
  const { amount, userId } = req.body; // Amount humesha cents mein hota hai (100 = $1)
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { userId: userId }, // Ye metadata webhook mein wapis milega
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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