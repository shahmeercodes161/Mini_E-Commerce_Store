import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js'; // <-- FIXED: Added Order model import

dotenv.config();

// Automatically generating 60 distinct items to fulfill the 50-100 requirement
const categories = ['Electronics', 'Accessories', 'Men', 'Apparel', 'Home & Kitchen'];
const itemNames = {
  'Electronics': ['Wireless Headphones', 'Mechanical Keyboard', 'Gaming Mouse', 'Bluetooth Speaker', 'RGB Ring Light', 'USB-C Docking Station', 'Dual Monitor Mount', 'Wireless Charger Pad', 'Webcam 1080p', 'Portable Power Bank', 'Noise Cancelling Earbuds', 'Smart Fitness Watch'],
  'Accessories': ['Leather Wallet', 'Modern Analog Watch', 'Geometric Backpack', 'Minimalist Key Holder', 'Polarized Sunglasses', 'Travel Passport Case', 'Canvas Tote Bag', 'Classic Leather Belt', 'Stainless Steel Ring', 'Premium Silk Tie', 'Silver Cufflinks', 'Wool Scarf'],
  'Men': ['Classic Denim Shirt', 'React Bomber Jacket', 'Slim Fit Chinos', 'Casual Suede Loafers', 'Tailored Blazer', 'Athletic Gym Shorts', 'Premium Cotton Hoodie', 'Linen Summer Shirt', 'Waterproof Windbreaker', 'Oxford Dress Shoes', 'Vintage Graphic Tee', 'Knitted Sweater'],
  'Apparel': ['Running Shoes', 'Cozy Lounge Pants', 'Puffer Winter Vest', 'Breathable Socks Pack', 'Baseball Cap', 'Fleece Active Jacket', 'Training Tracksuit', 'Smart Casual Polo', 'Denim Jeans Jacket', 'Slip-on Sneakers', 'Thermal Base Layer', 'Leather Boots'],
  'Home & Kitchen': ['Stainless Water Bottle', 'LED Desk Lamp', 'Ceramic Coffee Mug', 'Memory Foam Pillow', 'Digital Kitchen Scale', 'French Press Maker', 'Non-Stick Frying Pan', 'Bamboo Cutting Board', 'Electric Milk Frother', 'Aromatic Oil Diffuser', 'Insulated Lunch Box', 'Magnetic Knife Strip']
};

const sampleProducts = [];

// Loop to build out the catalog dynamically
categories.forEach(cat => {
  itemNames[cat].forEach((name, index) => {
    // Generate a diverse range of realistic prices
    const price = parseFloat((20 + (index * 15) + Math.random() * 5).toFixed(2));
    
    // Set up varied stock quantities, including a few out of stock items
    const stockQuantity = (index === 4) ? 0 : Math.floor(10 + (Math.random() * 40));

    sampleProducts.push({
      name: name,
      category: cat,
      price: price,
      stockQuantity: stockQuantity,
      imageUrl: 'https://placeholder.com'
    });
  });
});

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // FIXED: Clear existing products and old orders to prevent duplicates
    await Product.deleteMany({});
    await Order.deleteMany({}); // <-- FIXED: Clears your entire customer order history collection
    console.log('Old products and order history records cleared.');

    // Insert new sample items
    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} items into the database!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase();