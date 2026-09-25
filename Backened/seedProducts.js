import Product from './models/Product.js';
import User from './models/User.js';

export const INITIAL_PRODUCTS = [
  {
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 79.99,
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 99.99,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Gaming Mouse',
    category: 'Electronics',
    price: 49.99,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 59.99,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Leather Wallet',
    category: 'Accessories',
    price: 34.99,
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Modern Analog Watch',
    category: 'Accessories',
    price: 129.99,
    stockQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Geometric Backpack',
    category: 'Accessories',
    price: 65.00,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Classic Denim Shirt',
    category: 'Men',
    price: 45.00,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'React Bomber Jacket',
    category: 'Men',
    price: 89.99,
    stockQuantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Casual Suede Loafers',
    category: 'Men',
    price: 75.00,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Running Shoes',
    category: 'Apparel',
    price: 85.00,
    stockQuantity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fleece Active Jacket',
    category: 'Apparel',
    price: 69.50,
    stockQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Stainless Water Bottle',
    category: 'Home & Kitchen',
    price: 24.99,
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'LED Desk Lamp',
    category: 'Home & Kitchen',
    price: 39.99,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ceramic Coffee Mug',
    category: 'Home & Kitchen',
    price: 15.00,
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  }
];

export async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Database products collection is empty. Seeding initial store catalog...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`✅ Successfully seeded ${INITIAL_PRODUCTS.length} store products into MongoDB!`);
    } else {
      // Sync image URLs for any product currently lacking a real image
      for (const item of INITIAL_PRODUCTS) {
        await Product.updateOne(
          { name: item.name, $or: [{ imageUrl: '' }, { imageUrl: null }, { imageUrl: { $exists: false } }] },
          { $set: { imageUrl: item.imageUrl } }
        );
      }
    }

    // Seed Default Admin User if not exists
    const adminUser = await User.findOne({ email: 'admin@doorstep.com' });
    if (!adminUser) {
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
