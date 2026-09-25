import Order from '../models/Order.js';
import Product from '../models/Product.js';

// 1. Process Checkout (Verify stock, calculate total, deduct inventory, save order)
export const checkout = async (req, res) => {
  try {
    const { customerName, customerEmail, cartItems, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Your shopping cart is empty" });
    }

    let subtotal = 0;
    const finalOrderItems = [];

    // Loop through each item in the cart to check inventory
    for (const item of cartItems) {
      const dbProduct = await Product.findById(item.productId);
      
      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found` });
      }

      // Requirement: Prevent cart quantity from exceeding available inventory
      if (dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stockQuantity} left.` 
        });
      }

      // Accumulate backend calculations safely (never trust prices from frontend)
      subtotal += dbProduct.price * item.quantity;

      finalOrderItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        priceAtPurchase: dbProduct.price
      });

      // Requirement: Reduce inventory stock levels
      dbProduct.stockQuantity -= item.quantity;
      await dbProduct.save();
    }

    // Calculate totals (8% tax rate to match the frontend calculation)
    const tax = subtotal * 0.08;
    const total = parseFloat((subtotal + tax).toFixed(2)); 

    // Create and save unique order record
    const newOrder = new Order({
      customerName,
      customerEmail,
      items: finalOrderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total,
      status: 'Completed',
      paymentMethod: paymentMethod || 'Stripe'
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
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order logs', error: error.message });
  }
};