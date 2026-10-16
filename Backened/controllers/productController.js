import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { processUploadedImage } from '../middleware/upload.js';
import { INITIAL_PRODUCTS, seedInitialData } from '../seedProducts.js';
import { connectToMongo } from '../db/connect.js';

// Helper to ensure MongoDB is ready before database operations
const ensureDb = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectToMongo();
    } catch (err) {
      console.warn('Notice ensuring MongoDB in productController:', err.message);
    }
  }
};

// 1. Get all products (with search & category filtering)
export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    await ensureDb();

    if (mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find(query).sort({ createdAt: -1 });
      if (dbProducts.length > 0) {
        return res.status(200).json(dbProducts);
      }
      // If DB has 0 products, seed defaults automatically
      await seedInitialData();
      const seeded = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json(seeded);
    }

    // Fallback response if database connection is unreachable
    let fallback = [...INITIAL_PRODUCTS.map((p, idx) => ({ _id: `seed-${idx + 1}`, ...p }))];
    if (category && category !== 'All') {
      fallback = fallback.filter(p => p.category === category);
    }
    if (search) {
      fallback = fallback.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    res.status(200).json(fallback);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
};

// 2. Get a single product detail by ID
export const getProductById = async (req, res) => {
  try {
    await ensureDb();
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
};

// 3. Upload product image via Multer (Saves to Cloudinary or static folder)
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imageUrl = await processUploadedImage(req.file, req);
    res.status(200).json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing image upload', error: error.message });
  }
};

// 4. Admin View: Add a new product (Stored permanently in MongoDB)
export const createProduct = async (req, res) => {
  try {
    let { name, category, price, stockQuantity, imageUrl } = req.body;
    
    // If an image file was uploaded with this request
    if (req.file) {
      imageUrl = await processUploadedImage(req.file, req);
    }

    await ensureDb();

    if (mongoose.connection.readyState === 1) {
      const newProduct = new Product({
        name: name.trim(),
        category: category || 'Accessories',
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        imageUrl: imageUrl || ""
      });
      await newProduct.save();
      return res.status(201).json(newProduct);
    }

    return res.status(503).json({
      message: 'Database is currently connecting. Please retry in a moment.'
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
};

// 5. Admin View: Update / Restock a product
export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = await processUploadedImage(req.file, req);
    }
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stockQuantity) updateData.stockQuantity = Number(updateData.stockQuantity);

    await ensureDb();

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

// 6. Admin View: Delete a product
export const deleteProduct = async (req, res) => {
  try {
    await ensureDb();

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};