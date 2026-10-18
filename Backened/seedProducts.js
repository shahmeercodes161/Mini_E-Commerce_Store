import Product from './models/Product.js';
import User from './models/User.js';

export const INITIAL_PRODUCTS = [
  // --- Electronics (12) ---
  {
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 79.99,
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 99.99,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Gaming Mouse',
    category: 'Electronics',
    price: 49.99,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    price: 59.99,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'RGB Ring Light',
    category: 'Electronics',
    price: 45.00,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1627844642677-8495a6390a36?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'USB-C Docking Station',
    category: 'Electronics',
    price: 69.99,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dual Monitor Mount',
    category: 'Electronics',
    price: 89.00,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Wireless Charger Pad',
    category: 'Electronics',
    price: 29.99,
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Webcam 1080p',
    category: 'Electronics',
    price: 54.99,
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Portable Power Bank',
    category: 'Electronics',
    price: 39.99,
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Noise Cancelling Earbuds',
    category: 'Electronics',
    price: 89.99,
    stockQuantity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Smart Fitness Watch',
    category: 'Electronics',
    price: 119.99,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
  },

  // --- Accessories (12) ---
  {
    name: 'Leather Wallet',
    category: 'Accessories',
    price: 34.99,
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Modern Analog Watch',
    category: 'Accessories',
    price: 129.99,
    stockQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Geometric Backpack',
    category: 'Accessories',
    price: 65.00,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Minimalist Key Holder',
    category: 'Accessories',
    price: 19.99,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1614350275811-e6ca97fc46cb?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Polarized Sunglasses',
    category: 'Accessories',
    price: 49.99,
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Travel Passport Case',
    category: 'Accessories',
    price: 24.50,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Canvas Tote Bag',
    category: 'Accessories',
    price: 29.00,
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Classic Leather Belt',
    category: 'Accessories',
    price: 39.00,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Stainless Steel Ring',
    category: 'Accessories',
    price: 22.00,
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Premium Silk Tie',
    category: 'Accessories',
    price: 32.50,
    stockQuantity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Silver Cufflinks',
    category: 'Accessories',
    price: 45.00,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Wool Scarf',
    category: 'Accessories',
    price: 38.00,
    stockQuantity: 19,
    imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80'
  },

  // --- Men (12) ---
  {
    name: 'Classic Denim Shirt',
    category: 'Men',
    price: 45.00,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'React Bomber Jacket',
    category: 'Men',
    price: 89.99,
    stockQuantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Slim Fit Chinos',
    category: 'Men',
    price: 52.00,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Casual Suede Loafers',
    category: 'Men',
    price: 75.00,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Tailored Blazer',
    category: 'Men',
    price: 139.00,
    stockQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Athletic Gym Shorts',
    category: 'Men',
    price: 28.00,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Premium Cotton Hoodie',
    category: 'Men',
    price: 59.99,
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Linen Summer Shirt',
    category: 'Men',
    price: 48.00,
    stockQuantity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Waterproof Windbreaker',
    category: 'Men',
    price: 79.00,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Oxford Dress Shoes',
    category: 'Men',
    price: 105.00,
    stockQuantity: 11,
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Vintage Graphic Tee',
    category: 'Men',
    price: 29.99,
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Knitted Sweater',
    category: 'Men',
    price: 64.00,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
  },

  // --- Apparel (12) ---
  {
    name: 'Running Shoes',
    category: 'Apparel',
    price: 85.00,
    stockQuantity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cozy Lounge Pants',
    category: 'Apparel',
    price: 36.00,
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Puffer Winter Vest',
    category: 'Apparel',
    price: 68.00,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Breathable Socks Pack',
    category: 'Apparel',
    price: 18.00,
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Baseball Cap',
    category: 'Apparel',
    price: 24.00,
    stockQuantity: 32,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fleece Active Jacket',
    category: 'Apparel',
    price: 69.50,
    stockQuantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Training Tracksuit',
    category: 'Apparel',
    price: 92.00,
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Smart Casual Polo',
    category: 'Apparel',
    price: 38.00,
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Denim Jeans Jacket',
    category: 'Apparel',
    price: 78.00,
    stockQuantity: 17,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Slip-on Sneakers',
    category: 'Apparel',
    price: 58.00,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Thermal Base Layer',
    category: 'Apparel',
    price: 42.00,
    stockQuantity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Leather Boots',
    category: 'Apparel',
    price: 115.00,
    stockQuantity: 14,
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80'
  },

  // --- Home & Kitchen (12) ---
  {
    name: 'Stainless Water Bottle',
    category: 'Home & Kitchen',
    price: 24.99,
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'LED Desk Lamp',
    category: 'Home & Kitchen',
    price: 39.99,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ceramic Coffee Mug',
    category: 'Home & Kitchen',
    price: 15.00,
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Memory Foam Pillow',
    category: 'Home & Kitchen',
    price: 44.00,
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Digital Kitchen Scale',
    category: 'Home & Kitchen',
    price: 26.50,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'French Press Maker',
    category: 'Home & Kitchen',
    price: 34.00,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Non-Stick Frying Pan',
    category: 'Home & Kitchen',
    price: 49.00,
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bamboo Cutting Board',
    category: 'Home & Kitchen',
    price: 28.00,
    stockQuantity: 34,
    imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Electric Milk Frother',
    category: 'Home & Kitchen',
    price: 22.99,
    stockQuantity: 42,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Aromatic Oil Diffuser',
    category: 'Home & Kitchen',
    price: 36.00,
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Insulated Lunch Box',
    category: 'Home & Kitchen',
    price: 31.00,
    stockQuantity: 26,
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Magnetic Knife Strip',
    category: 'Home & Kitchen',
    price: 33.00,
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80'
  }
];

// Helper to update any missing or broken product images in MongoDB Atlas
export async function syncProductImages() {
  try {
    for (const item of INITIAL_PRODUCTS) {
      await Product.updateMany(
        {
          name: item.name,
          $or: [
            { imageUrl: '/vite.svg' },
            { imageUrl: 'https://placeholder.com' },
            { imageUrl: '' },
            { imageUrl: null },
            { imageUrl: { $exists: false } },
            { imageUrl: { $regex: 'vite\\.svg|placeholder' } }
          ]
        },
        { $set: { imageUrl: item.imageUrl } }
      );
    }
    console.log('✅ Synchronized all 60 product images with high-resolution photos!');
  } catch (err) {
    console.warn('Notice syncing product images:', err.message);
  }
}

export async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Database products collection is empty. Seeding initial store catalog (60 items)...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`✅ Successfully seeded ${INITIAL_PRODUCTS.length} store products into MongoDB!`);
    } else {
      // Sync any products that currently have /vite.svg or missing images
      await syncProductImages();
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
