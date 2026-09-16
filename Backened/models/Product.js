import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  stockQuantity: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  imageUrl: { 
    type: String, 
    default: "" 
  }
}, { timestamps: true });

// CRITICAL FIX: Changed from module.exports to export default
export default mongoose.model('Product', productSchema);