import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get a user's profile and list their products
router.get('/:id', getUserProfile);

// Protected route to update a user's own profile (bio/picture)
router.put('/profile', protect, updateUserProfile);

export default router;
