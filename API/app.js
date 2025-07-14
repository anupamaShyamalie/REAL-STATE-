// app.js (or server.js)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Import your existing routes
import authRoute from './routes/auth.route.js';
import postRoute from './routes/post.route.js';
import testRoute from './routes/test.route.js';
import userRoute from './routes/user.route.js';

// Import the new chat routes
import chatRoute from './routes/chat.route.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Store online users
let onlineUsers = new Map();

// Socket.IO middleware for authentication (updated to match your pattern)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const verifyJWT = promisify(jwt.verify);
    const payload = await verifyJWT(token, process.env.JWT_SECRET_KEY);
    
    socket.userId = payload.id;
    socket.username = payload.username;
    socket.isAdmin = payload.isAdmin;
    
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.username} connected`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    userId: socket.userId
  });

  // Emit online users to all clients
  io.emit('getOnlineUsers', Array.from(onlineUsers.values()));

  // Join user to their personal room
  socket.join(socket.userId);

  // Handle joining a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.username} joined chat ${chatId}`);
  });

  // Handle leaving a chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.username} left chat ${chatId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    const { chatId, receiverId, message, senderId } = data;
    
    try {
      // Save message to database (implement your database logic here)
      const newMessage = {
        id: Date.now().toString(), // Use proper ID generation in production
        chatId,
        senderId,
        receiverId,
        content: message,
        createdAt: new Date(),
        read: false
      };

      // Emit message to chat room
      io.to(chatId).emit('receiveMessage', newMessage);
      
      // Emit notification to receiver if they're online
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('newMessageNotification', {
          chatId,
          senderId,
          senderUsername: socket.username,
          message: message.length > 50 ? message.substring(0, 50) + '...' : message
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('userTyping', {
      userId: socket.userId,
      username: socket.username,
      isTyping: true
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.chatId).emit('userTyping', {
      userId: socket.userId,
      username: socket.username,
      isTyping: false
    });
  });

  // Handle marking messages as read
  socket.on('markAsRead', (data) => {
    const { chatId, messageIds } = data;
    // Update database to mark messages as read
    socket.to(chatId).emit('messagesRead', { messageIds, readBy: socket.userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.username} disconnected`);
    onlineUsers.delete(socket.userId);
    io.emit('getOnlineUsers', Array.from(onlineUsers.values()));
  });
});

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/test', testRoute);

// Add the chat routes
app.use('/api/chats', chatRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});