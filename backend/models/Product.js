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
    unit: { type: String },
    isDigital: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    fileUrl: { type: String },
    demoFileUrl: { type: String },
    subjectSlug: { type: String },
    slug: { type: String },
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

// Performance: Indexing frequently queried fields
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ user: 1 });
productSchema.index({ subjectSlug: 1, unit: 1 });
productSchema.index({ slug: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
