import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Product'
  },
  name: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  shippingAddress: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  postalCode: {
    type: String,
    default: ''
  },
  orderNotes: {
    type: String,
    default: ''
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Processing', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  }
}, { timestamps: true });

// CRITICAL FIX: Changed from module.exports to export default
export default mongoose.model('Order', orderSchema);