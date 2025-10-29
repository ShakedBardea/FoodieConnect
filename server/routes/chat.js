const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  sendMessage,
  getConversations,
  getUnreadCount,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes require authentication
router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:userId', protect, getChatHistory);
router.post('/:userId', protect, sendMessage);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;
