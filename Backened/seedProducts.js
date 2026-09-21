import Product from './models/Product.js';
import User from './models/User.js';

export const INITIAL_PRODUCTS = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stockQuantity: 25, imageUrl: '' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 99.99, stockQuantity: 18, imageUrl: '' },
  { name: 'Gaming Mouse', category: 'Electronics', price: 49.99, stockQuantity: 30, imageUrl: '' },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stockQuantity: 14, imageUrl: '' },
  { name: 'Leather Wallet', category: 'Accessories', price: 34.99, stockQuantity: 22, imageUrl: '' },
  { name: 'Modern Analog Watch', category: 'Accessories', price: 129.99, stockQuantity: 10, imageUrl: '' },
  { name: 'Geometric Backpack', category: 'Accessories', price: 65.00, stockQuantity: 15, imageUrl: '' },
  { name: 'Classic Denim Shirt', category: 'Men', price: 45.00, stockQuantity: 20, imageUrl: '' },
  { name: 'React Bomber Jacket', category: 'Men', price: 89.99, stockQuantity: 8, imageUrl: '' },
  { name: 'Casual Suede Loafers', category: 'Men', price: 75.00, stockQuantity: 12, imageUrl: '' },
  { name: 'Running Shoes', category: 'Apparel', price: 85.00, stockQuantity: 16, imageUrl: '' },
  { name: 'Fleece Active Jacket', category: 'Apparel', price: 69.50, stockQuantity: 10, imageUrl: '' },
  { name: 'Stainless Water Bottle', category: 'Home & Kitchen', price: 24.99, stockQuantity: 35, imageUrl: '' },
  { name: 'LED Desk Lamp', category: 'Home & Kitchen', price: 39.99, stockQuantity: 20, imageUrl: '' },
  { name: 'Ceramic Coffee Mug', category: 'Home & Kitchen', price: 15.00, stockQuantity: 40, imageUrl: '' }
];

export async function seedInitialData() {
  try {
    // 1. Seed Products if collection is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Database products collection is empty. Seeding initial store catalog...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`✅ Successfully seeded ${INITIAL_PRODUCTS.length} store products into MongoDB!`);
    } else {
      console.log(`ℹ️ Products already present in MongoDB (${productCount} found).`);
    }

    // 2. Seed Default Admin User if not exists
    const adminUser = await User.findOne({ email: 'admin@doorstep.com' });
    if (!adminUser) {
      console.log('👤 Seeding default Master Admin into MongoDB...');
      await User.create({
        name: 'Master Admin',
        email: 'admin@doorstep.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default Master Admin saved to MongoDB.');
    }
  } catch (error) {
    console.warn('⚠️ Notice during initial data seeding:', error.message);
  }
}
