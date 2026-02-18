import Stripe from "stripe";
import Dotenv from 'dotenv'
Dotenv.config({})


const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error("STRIPE_SECRET_KEY is required in .env");
export const stripe = new Stripe(secret);

