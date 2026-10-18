import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { connectToMongo } from '../db/connect.js';

// Helper to ensure MongoDB is ready
const ensureDb = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectToMongo();
    } catch (err) {
      console.warn('Notice ensuring MongoDB in orderController:', err.message);
    }
  }
};

// 1. Process Checkout (Verify stock, calculate total, deduct inventory, save order)
export const checkout = async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      phone, 
      shippingAddress, 
      city, 
      postalCode, 
      orderNotes, 
      cartItems, 
      paymentMethod 
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Your shopping cart is empty" });
    }

    await ensureDb();

    let subtotal = 0;
    const finalOrderItems = [];

    // Loop through each item in the cart to check inventory
    for (const item of cartItems) {
      let dbProduct = null;
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        dbProduct = await Product.findById(item.productId);
      }
      if (!dbProduct && item.name) {
        dbProduct = await Product.findOne({ name: item.name });
      }

      const itemPrice = dbProduct ? dbProduct.price : Number(item.price || 0);
      const itemName = dbProduct ? dbProduct.name : (item.name || 'Store Product');

      if (dbProduct) {
        if (dbProduct.stockQuantity < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stockQuantity} left.` 
          });
        }
        dbProduct.stockQuantity -= item.quantity;
        await dbProduct.save();
      }

      subtotal += itemPrice * item.quantity;

      finalOrderItems.push({
        product: dbProduct ? dbProduct._id : item.productId,
        name: itemName,
        quantity: item.quantity,
        priceAtPurchase: itemPrice
      });
    }

    // Calculate totals (8% tax rate to match the frontend calculation)
    const tax = subtotal * 0.08;
    const total = parseFloat((subtotal + tax).toFixed(2)); 

    const isCod = paymentMethod === 'Cash on Delivery';

    // Create and save unique order record with complete shipping and contact info
    const newOrder = new Order({
      customerName: (customerName || 'Customer').trim(),
      customerEmail: (customerEmail || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      shippingAddress: (shippingAddress || '').trim(),
      city: (city || '').trim(),
      postalCode: (postalCode || '').trim(),
      orderNotes: (orderNotes || '').trim(),
      items: finalOrderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total,
      status: isCod ? 'Pending' : 'Completed',
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    await newOrder.save();
    res.status(201).json({ message: "Checkout completed successfully!", order: newOrder });

  } catch (error) {
    res.status(500).json({ message: 'Checkout transaction failed', error: error.message });
  }
};

// 2. View Order History
export const getOrderHistory = async (req, res) => {
  try {
    await ensureDb();
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order logs', error: error.message });
  }
};