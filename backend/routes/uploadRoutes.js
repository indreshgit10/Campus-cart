import express from 'express';
import { getCloudinarySignature } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/upload/signature
// @access  Private
router.get('/signature', protect, getCloudinarySignature);

export default router;
