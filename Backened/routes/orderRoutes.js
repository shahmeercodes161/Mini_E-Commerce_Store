import express from 'express';
import { checkout, getOrderHistory } from '../controllers/orderController.js';

const router = express.Router();

// Route to handle checking out the shopping cart
router.post('/checkout', checkout);

// Route to fetch past customer purchases
router.get('/history', getOrderHistory);

export default router;