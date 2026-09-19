import Product from '../models/Product.js';

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

// 3. Admin View: Add a new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stockQuantity, imageUrl } = req.body;
    
    const newProduct = new Product({
      name,
      category,
      price,
      stockQuantity,
      imageUrl
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
};

// 4. Admin View: Update / Restock a product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// 5. Admin View: Delete a product
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