// context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      // Create socket connection
      const newSocket = io('http://localhost:8800', {
        auth: {
          token: localStorage.getItem('token') // Or however you store your JWT
        }
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      // Listen for online users
      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Listen for new message notifications
      newSocket.on('newMessageNotification', (notification) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          ...notification,
          timestamp: new Date()
        }]);
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setOnlineUsers([]);
        setNotifications([]);
      }
    }
  }, [currentUser]);

  // Socket methods
  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('joinChat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leaveChat', chatId);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('sendMessage', messageData);
    }
  };

  const markAsRead = (chatId, messageIds) => {
    if (socket) {
      socket.emit('markAsRead', { chatId, messageIds });
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('stopTyping', { chatId });
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    removeNotification,
    clearAllNotifications,
    isUserOnline: (userId) => onlineUsers.some(user => user.userId === userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};