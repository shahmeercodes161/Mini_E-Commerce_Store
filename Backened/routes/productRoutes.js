import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct } from '../controllers/productController.js';

const router = express.Router();

// Public routes for customers
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', createProduct);
router.put('/:id', updateProduct);

// CRITICAL FIX: This must use export default to match your index.js!
export default router;