import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Public routes for customers
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// CRITICAL FIX: This must use export default to match your index.js!
export default router;