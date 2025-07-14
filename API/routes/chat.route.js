import express from 'express';
import { 
  getChats, 
  createChat, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  deleteMessage,
  getUsers 
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Chat routes
router.get('/', verifyToken, getChats);
router.post('/', verifyToken, createChat);

// User routes for chat (MOVE THIS BEFORE THE PARAMETERIZED ROUTES)
router.get('/users', verifyToken, getUsers);

// Message routes
router.get('/:chatId/messages', verifyToken, getMessages);
router.post('/messages', verifyToken, sendMessage);
router.patch('/messages/read', verifyToken, markAsRead);
router.delete('/messages/:messageId', verifyToken, deleteMessage);

export default router;