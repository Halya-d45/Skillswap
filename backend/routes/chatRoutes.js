import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes are protected by JWT authentication
router.use(protect);

// GET /api/chat/conversations - List all conversations for accepted requests
router.get('/conversations', getConversations);

// GET /api/chat/messages/:requestId - Get messages for an accepted request
router.get('/messages/:requestId', getMessages);

// POST /api/chat/messages/:requestId - Send a new message
router.post('/messages/:requestId', sendMessage);

// PUT /api/chat/messages/:requestId/read - Mark messages as read
router.put('/messages/:requestId/read', markAsRead);

export default router;
