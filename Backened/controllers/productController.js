import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { processUploadedImage } from '../middleware/upload.js';
import { INITIAL_PRODUCTS } from '../seedProducts.js';

// In-memory cache for admin creations while DB is connecting
let pendingProducts = [];

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

    if (mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json(dbProducts);
    }

    // Graceful response while Atlas connection handshake or IP whitelist is in progress
    let fallback = [...pendingProducts, ...INITIAL_PRODUCTS.map((p, idx) => ({ _id: `seed-${idx + 1}`, ...p }))];
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
};

// 3. Upload product image via Multer (Saves on PC or Cloudinary)
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

// 4. Admin View: Add a new product (supports JSON or multipart upload)
export const createProduct = async (req, res) => {
  try {
    let { name, category, price, stockQuantity, imageUrl } = req.body;
    
    // If an image file was uploaded with this request
    if (req.file) {
      imageUrl = await processUploadedImage(req.file, req);
    }

    if (mongoose.connection.readyState === 1) {
      const newProduct = new Product({
        name,
        category,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        imageUrl: imageUrl || ""
      });
      await newProduct.save();
      return res.status(201).json(newProduct);
    }

    // Temporary memory storage until Atlas IP whitelist is active
    const tempProduct = {
      _id: 'custom-' + Date.now(),
      name,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString()
    };
    pendingProducts.unshift(tempProduct);
    res.status(201).json(tempProduct);
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

    if (mongoose.connection.readyState === 1) {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json(updatedProduct);
    }

    // In-memory fallback
    const idx = pendingProducts.findIndex(p => p._id === req.params.id);
    if (idx !== -1) {
      pendingProducts[idx] = { ...pendingProducts[idx], ...updateData };
      return res.status(200).json(pendingProducts[idx]);
    }
    res.status(200).json({ _id: req.params.id, ...updateData });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

// 6. Admin View: Delete a product
export const deleteProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
    }

    pendingProducts = pendingProducts.filter(p => p._id !== req.params.id);
    res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};