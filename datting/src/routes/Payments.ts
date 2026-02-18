import { Router } from "express";
import { payments, cancelSubscription } from "../services/payments";

const Payments = Router();
// Webhook route index.ts mein pehle register hai (raw body ke liye)
Payments.post("/create-payment-intent", payments);
Payments.post("/cancel-subscription", cancelSubscription);

export default Payments;