import express from 'express';
import { getMessages, addMessage, getConversations, markAsRead, getUnreadCount } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read/:productId', protect, markAsRead);
router.get('/:productId', protect, getMessages);
router.post('/', protect, addMessage);

export default router;
