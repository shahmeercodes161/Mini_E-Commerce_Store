/**
 * Stripe Frontend Configuration
 * -----------------------------
 * WHAT IS THIS? (Easy to tell your Sir):
 * - This is the Stripe Publishable Key.
 * - Unlike the Secret Key (which is stored ONLY in the backend .env),
 *   the Publishable Key is safe to be in the frontend.
 * - It identifies our specific Stripe merchant account to the browser.
 */
export const STRIPE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
