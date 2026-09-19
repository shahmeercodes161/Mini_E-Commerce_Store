import Product from '../models/Product.js';
import { processUploadedImage } from '../middleware/upload.js';

// 1. Get all products (with search & category filtering)
export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query);
    res.status(200).json(products);
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

    const newProduct = new Product({
      name,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      imageUrl: imageUrl || ""
    });

    await newProduct.save();
    res.status(201).json(newProduct);
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

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

// 6. Admin View: Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};