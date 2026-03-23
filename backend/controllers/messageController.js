import mongoose from 'mongoose';
import Message from '../models/Message.js';

// @desc    Get chat history for a product/user
// @route   GET /api/messages/:productId?with=userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    let { productId } = req.params;
    let { with: otherUserId } = req.query;
    const userId = req.user._id;

    let query = {};

    // If productId is a DM string (dm-...), we extract the user ID and treat as product: null
    if (productId?.startsWith('dm-')) {
      if (!otherUserId) otherUserId = productId.replace('dm-', '');
      productId = 'general';
    }

    if (productId === 'general' || !mongoose.Types.ObjectId.isValid(productId)) {
      // Direct Message (No valid product)
      if (!otherUserId) {
        return res.status(400).json({ message: 'receiverId (with) is required for DMs' });
      }
      query = {
        product: null,
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      };
    } else {
      // Product-based chat
      // If otherUserId is provided, find messages specifically between these two for this product
      if (otherUserId) {
        query = {
          product: productId,
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        };
      } else {
        // Fallback: get all messages for this product involving current user
        query = {
          product: productId,
          $or: [{ sender: userId }, { receiver: userId }]
        };
      }
    }

    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a message (fallback if socket fails or for persistence)
// @route   POST /api/messages
// @access  Private
export const addMessage = async (req, res) => {
  try {
    const { productId, receiverId, text } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      product: productId,
      text
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = String(req.user._id);

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .populate('product', 'title image price')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      // Robustly identify the other participant
      const senderId = String(msg.sender?._id || msg.sender);
      const receiverId = String(msg.receiver?._id || msg.receiver);
      
      const otherParticipant = senderId === userId ? msg.receiver : msg.sender;
      if (!otherParticipant) return;

      const otherParticipantId = String(otherParticipant._id || otherParticipant);
      const productId = msg.product ? String(msg.product._id) : null;
      const isUnread = !msg.isRead && String(msg.receiver?._id || msg.receiver) === userId;

      // Unique key for conversation: Product ID + Other Participant ID
      const convId = productId ? `${productId}-${otherParticipantId}` : `dm-${otherParticipantId}`;

      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          convId,
          productId: productId || `dm-${otherParticipantId}`,
          productTitle: msg.product ? msg.product.title : `Direct Chat with ${otherParticipant.name || 'User'}`,
          productImage: msg.product ? msg.product.image : (otherParticipant.profilePicture || null),
          otherParticipantName: otherParticipant.name || 'User',
          otherParticipantId: otherParticipantId,
          lastMessage: msg.text,
          updatedAt: msg.createdAt,
          hasUnread: isUnread
        });
      } else if (isUnread) {
        // If we found an unread message for this conversation, mark the whole conv as unread
        conversationsMap.get(convId).hasUnread = true;
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:productId?with=userId
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { productId } = req.params;
    const { with: otherUserId } = req.query;
    const userId = req.user._id;

    let query = {
      receiver: userId,
      sender: otherUserId,
      isRead: false
    };

    if (productId === 'general' || productId?.startsWith('dm-')) {
      query.product = null;
    } else {
      query.product = productId;
    }

    await Message.updateMany(query, { isRead: true });
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread count for user
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
