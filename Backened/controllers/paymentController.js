import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Lazy-getter for Stripe so missing environment variables do not crash module loading
let stripeInstance = null;
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing. Please add STRIPE_SECRET_KEY to your Vercel Project Environment Variables.");
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
};

/**
 * Controller: createCheckoutSession
 * ---------------------------------
 * HOW IT WORKS (Easy to explain to your Sir):
 * 1. Frontend sends cart items, customer name, and customer email.
 * 2. We convert each cart item into Stripe's "line_items" format.
 *    NOTE: Stripe calculates money in the smallest currency unit (cents),
 *    so $10.00 becomes 1000 cents (item.price * 100).
 * 3. We call `stripe.checkout.sessions.create()` with:
 *    - payment_method_types: ['card'] (Credit/Debit card)
 *    - mode: 'payment' (One-time payment)
 *    - line_items: our converted cart items
 *    - success_url: where Stripe redirects after customer pays successfully
 *    - cancel_url: where Stripe redirects if customer cancels
 * 4. Stripe returns a secure session URL (`session.url`).
 * 5. We send that URL back to the frontend so the frontend can redirect the user.
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, customerEmail, customerName, clientOrigin } = req.body;

    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Your shopping cart is empty." });
    }

    // Dynamically determine the frontend client origin for redirect:
    // Ensures Stripe redirects back to the EXACT port the store is open on (e.g. 5175, 5173, etc.)
    let clientUrl = clientOrigin || req.headers.origin;
    if (!clientUrl && req.headers.referer) {
      try {
        clientUrl = new URL(req.headers.referer).origin;
      } catch {}
    }
    if (!clientUrl) {
      clientUrl = process.env.CLIENT_URL || "https://mini-e-commerce-store-two.vercel.app";
    }

    // Format each cart item for Stripe line_items
    const line_items = cartItems.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            // Stripe accepts an array of public image URLs (optional)
            images: item.imageUrl && item.imageUrl.startsWith('http') ? [item.imageUrl] : [],
          },
          // Stripe requires price in cents: $15.50 -> 1550 cents
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe Secret Key is missing. Please add STRIPE_SECRET_KEY to your Vercel Project Environment Variables.",
      });
    }

    const stripe = getStripe();

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: line_items,
      customer_email: customerEmail || undefined,
      metadata: {
        customerName: customerName || 'Valued Customer',
      },
      // When payment succeeds, Stripe redirects to this URL:
      success_url: `${clientUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      // When payment is cancelled, Stripe redirects to this URL:
      cancel_url: `${clientUrl}/?payment=cancelled`,
    });

    // Return the session URL back to frontend
    res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe Session Creation Error:", error);
    res.status(500).json({
      message: error.message || "Failed to create Stripe payment session",
      error: error.message,
    });
  }
};

/**
 * Controller: verifyPaymentSession
 * ---------------------------------
 * Used when frontend returns from Stripe to confirm payment status directly with Stripe.
 */
export const verifyPaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe Secret Key is missing in Vercel Environment Variables.",
      });
    }

    const stripe = getStripe();

    // Retrieve the checkout session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.status(200).json({
      paymentStatus: session.payment_status, // 'paid' or 'unpaid'
      customerEmail: session.customer_details?.email || session.customer_email,
      totalAmount: session.amount_total / 100, // convert cents back to dollars
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying Stripe session",
      error: error.message,
    });
  }
};
