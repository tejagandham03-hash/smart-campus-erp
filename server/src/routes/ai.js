const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getConversations,
  deleteConversation,
  clearConversation,
} = require('../controllers/ai');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limit for AI requests
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 30,
  message: {
    success: false,
    message: 'Too many AI requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', protect, aiLimiter, sendMessage);
router.get('/chat/history', protect, getChatHistory);
router.get('/conversations', protect, getConversations);
router.delete('/chat/:conversationId', protect, deleteConversation);
router.put('/chat/:conversationId/clear', protect, clearConversation);

module.exports = router;
