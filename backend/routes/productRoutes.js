import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getMyProducts, getProductBySlug } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, createProduct);
router.route('/myproducts').get(protect, getMyProducts);
router.route('/notes/:subject/:unit').get(getProductBySlug);
router.route('/:id')
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
