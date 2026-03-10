import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    subject: { type: String },
    semester: { type: String },
    isDigital: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    fileUrl: { type: String },
    demoFileUrl: { type: String },
    status: { 
      type: String, 
      enum: ['Available', 'Pending', 'Sold'], 
      default: 'Available' 
    },
    condition: { 
      type: String, 
      enum: ['New', 'Like New', 'Good', 'Fair', 'Digital'],
      default: 'Good'
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
