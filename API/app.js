import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authRoute from "./routes/auth.route.js"
import testRoute from "./routes/test.route.js"
import userRoute from "./routes/user.route.js"
import postsRoute from "./routes/post.route.js"
import chatRoute from "./routes/chat.route.js"
import dotenv from "dotenv";

const prisma = new PrismaClient();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL?.replace(/\/$/, '') || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

dotenv.config();

app.use(cors({
  origin: process.env.CLIENT_URL?.replace(/\/$/, '') || "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoute);
app.use('/api/test', testRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postsRoute);
app.use('/api/chat', chatRoute);

// Socket.IO connection handling
const onlineUsers = new Map();

io.use((socket, next) => {
  // Get token from auth object or cookies
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Add user to online users
  onlineUsers.set(socket.userId, {
    userId: socket.userId,
    socketId: socket.id
  });
  
  // Emit online users to all clients
  io.emit('getOnlineUsers', Array.from(onlineUsers.values()));

  // Join chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (messageData) => {
    const { chatId, text, userId } = messageData;
    console.log('Message sent via socket:', { chatId, text, userId });
    
    try {
      // Save message to database
      const message = await prisma.message.create({
        data: {
          text,
          userId,
          chatId
        }
      });

      // Update chat's last message
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          lastMessage: text,
          seenBy: userId
        }
      });

      // Broadcast message to all users in the chat
      socket.to(chatId).emit('newMessage', {
        id: message.id,
        chatId,
        text,
        userId,
        createdAt: message.createdAt
      });
      
      // Send notification to other users in chat
      const notification = {
        chatId,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        userId,
        timestamp: new Date()
      };
      console.log('Sending notification:', notification);
      socket.to(chatId).emit('newMessageNotification', notification);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId }) => {
    socket.to(chatId).emit('userTyping', {
      chatId,
      userId: socket.userId
    });
  });

  socket.on('stopTyping', ({ chatId }) => {
    socket.to(chatId).emit('userStopTyping', {
      chatId,
      userId: socket.userId
    });
  });

  // Handle message read status
  socket.on('markAsRead', ({ chatId, messageIds }) => {
    socket.to(chatId).emit('messagesRead', {
      chatId,
      messageIds,
      userId: socket.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit('getOnlineUsers', Array.from(onlineUsers.values()));
  });
});

server.listen(5000, () => {
    console.log("Server is running...!", 5000);
});   