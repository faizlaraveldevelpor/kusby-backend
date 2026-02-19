import { Router } from "express";
import { payments, cancelSubscription } from "../services/payments";
import { getPaymentConfigApi } from "../services/paymentConfig";

const Payments = Router();

// Public API: app isse publishable key le sakti hai (DB se)
Payments.get("/payment-config", getPaymentConfigApi);

Payments.post("/create-payment-intent", payments);
Payments.post("/cancel-subscription", cancelSubscription);

export default Payments;