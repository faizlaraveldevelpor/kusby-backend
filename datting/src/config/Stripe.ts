import Stripe from "stripe";
import Dotenv from 'dotenv';
import path from 'path';

// Pehle current folder (datting), phir dist ke relative (jab dist/config se run ho)
Dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.STRIPE_SECRET_KEY) {
  Dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
}
// Agar abhi bhi nahi mila to dist/config se parent .env
if (!process.env.STRIPE_SECRET_KEY && typeof __dirname !== 'undefined') {
  Dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
}

// Trim karo taake .env se extra space/newline na aaye (invalid api key na aaye)
const raw = process.env.STRIPE_SECRET_KEY;
const secret = typeof raw === 'string' ? raw.trim() : '';
const isValidKey = secret.startsWith('sk_test_') || secret.startsWith('sk_live_');

let stripe: Stripe | null = null;
if (isValidKey) {
  try {
    stripe = new Stripe(secret);
  } catch (err: any) {
    console.error('Stripe init error:', err?.message || err);
  }
}
export { stripe };

