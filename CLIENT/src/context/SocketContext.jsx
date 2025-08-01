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
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        withCredentials: true // This will send cookies with the request
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server with socket ID:', newSocket.id);
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      // Listen for online users
      newSocket.on('getOnlineUsers', (users) => {
        console.log('Received online users:', users);
        setOnlineUsers(users);
      });

      // Listen for new message notifications
      newSocket.on('newMessageNotification', (notification) => {
        console.log('Received notification:', notification);
        console.log('Current user ID:', currentUser.id);
        console.log('Notification from user ID:', notification.userId);
        
        // Only increment count if notification is from another user
        if (notification.userId !== currentUser.id) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            ...notification,
            timestamp: new Date()
          }]);
          // Increment unread count
          setUnreadCount(prev => {
            console.log('Updating unread count from', prev, 'to', prev + 1);
            return prev + 1;
          });
        } else {
          console.log('Ignoring notification from self');
        }
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
      console.log('Emitting sendMessage via socket:', messageData);
      socket.emit('sendMessage', messageData);
    } else {
      console.error('Socket not connected, cannot send message');
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
    setUnreadCount(0);
    console.log('Unread count set to 0 by clearAllNotifications');
  };

  const markNotificationsAsRead = () => {
    setUnreadCount(0);
    console.log('Unread count set to 0 by markNotificationsAsRead');
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    unreadCount,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    removeNotification,
    clearAllNotifications,
    markNotificationsAsRead,
    isUserOnline: (userId) => onlineUsers.some(user => user.userId === userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};