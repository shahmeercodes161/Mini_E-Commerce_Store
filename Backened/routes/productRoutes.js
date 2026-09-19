import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage 
} from '../controllers/productController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes for customers
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
// 1. Standalone image upload route
router.post('/upload', upload.single('image'), uploadProductImage);

// 2. Product CRUD routes (supports direct multipart image or JSON imageUrl)
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;