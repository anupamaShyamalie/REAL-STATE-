import express from "express";
import { createChat, getChats, getMessages, sendMessage, markAsRead, deleteMessage, hideMessage } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create a new chat
router.post("/", createChat);

// Get all chats for current user
router.get("/", getChats);

// Get messages for a specific chat
router.get("/:chatId/messages", getMessages);

// Send a message
router.post("/:chatId/messages", sendMessage);

// Mark messages as read
router.put("/:chatId/read", markAsRead);

// Delete a message
router.delete("/messages/:messageId", deleteMessage);

// Hide message from user's view
router.post("/messages/:messageId/hide", hideMessage);

export default router;