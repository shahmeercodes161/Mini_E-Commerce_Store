import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';
import Product from './models/Product.js';
import Order from './models/Order.js';
import { INITIAL_PRODUCTS } from './seedProducts.js';
import { getMongoUri } from './db/connect.js';

dotenv.config();

// DNS resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

async function seedDatabase() {
  try {
    const mongoUri = getMongoUri();
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB.');

    // Clear existing products and orders
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing products and order history.');

    // Insert new high-resolution sample items (all 60 products)
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log(`✅ Successfully seeded all ${INITIAL_PRODUCTS.length} products with real images into MongoDB!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase();