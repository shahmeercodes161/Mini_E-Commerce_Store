import express from 'express';
import { createCheckoutSession, verifyPaymentSession } from '../controllers/paymentController.js';

const router = express.Router();

// =========================================================================
// STRIPE PAYMENT ROUTES
// =========================================================================

// POST /api/payment/create-checkout-session
// Receives cart items & customer info, creates Stripe hosted session, returns session URL
router.post('/create-checkout-session', createCheckoutSession);

// GET /api/payment/verify-session/:sessionId
// Verifies whether payment status is 'paid' for a given session
router.get('/verify-session/:sessionId', verifyPaymentSession);

export default router;
