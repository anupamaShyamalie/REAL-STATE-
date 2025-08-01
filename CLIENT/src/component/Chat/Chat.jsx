import { useState, useEffect, useRef, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import "./chat.scss";
import { MessageCircle, Plus, Search, Send, X, MoreVertical, Trash2, User, Clock, Check, CheckCheck, Menu, Users } from 'lucide-react';

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [hiddenMessages, setHiddenMessages] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { socket, joinChat, leaveChat, sendMessage, startTyping, stopTyping, isUserOnline, markNotificationsAsRead } = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Load chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await apiRequest.get("/chat");
        setChats(response.data);
        // Initialize unreadCounts from API
        const counts = {};
        response.data.forEach(chat => {
          counts[chat.id] = chat.unreadCount || 0;
        });
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      // Mark as read in backend
      apiRequest.post(`/chat/${selectedChat.id}/markAsRead`).catch(console.error);
      const fetchMessages = async () => {
        try {
          const response = await apiRequest.get(`/chat/${selectedChat.id}/messages`);
          setMessages(response.data);
          // Mark messages as read in frontend state
          markNotificationsAsRead();
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, markNotificationsAsRead]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages and update unread counts
    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      
      // Update unread counts if message is not from current chat
      if (!selectedChat || message.chatId !== selectedChat.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1
        }));
      } else {
        // Add message to current chat
        setMessages(prev => [...prev, message]);
      }
    };

    const handleTypingStart = (data) => {
      if (data.chatId === selectedChat?.id && data.userId !== currentUser.id) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    };

    const handleTypingStop = (data) => {
      if (data.chatId === selectedChat?.id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typingStart", handleTypingStart);
    socket.on("typingStop", handleTypingStop);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typingStart", handleTypingStart);
      socket.off("typingStop", handleTypingStop);
    };
  }, [socket, selectedChat, currentUser.id]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setUnreadCounts(prev => ({ ...prev, [chat.id]: 0 }));
    if (socket) {
      joinChat(chat.id);
    }
    // Close drawer on mobile after selecting chat
    setShowDrawer(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsTyping(false);
    stopTyping();
    setSendingMessage(true);

    try {
      // Create optimistic message for immediate UI feedback
      const optimisticMessage = {
        id: Date.now(),
        text: messageText,
        userId: currentUser.id,
        chatId: selectedChat.id,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);

      // Send message to server
      const response = await apiRequest.post(`/chat/${selectedChat.id}/messages`, {
        text: messageText
      });

      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.isOptimistic ? response.data : msg
      ));

      // Send via socket for real-time
      sendMessage(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setDeletingMessage(messageId);
      await apiRequest.delete(`/chat/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleHideMessage = async (messageId) => {
    try {
      await apiRequest.delete(`/chat/messages/${messageId}/hide`);
      setHiddenMessages(prev => new Set([...prev, messageId]));
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error hiding message:", error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 2000);
  };

  const handleNewChat = async () => {
    try {
      setUsersLoading(true);
      const response = await apiRequest.get("/users");
      setUsers(response.data);
      setShowNewChatModal(true);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await apiRequest.post("/chat", { userId });
      const newChat = response.data;
      setChats(prev => [newChat, ...prev]);
      setSelectedChat(newChat);
      setShowNewChatModal(false);
      setSearchQuery("");
      setShowDrawer(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleRemoveUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherUser = (chat) => {
    return chat.users.find(user => user.id !== currentUser.id);
  };

  const getDefaultAvatar = (username) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff&size=128&font-size=0.4`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Drawer */}
      <div className={`chat-drawer ${showDrawer ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <h2>Messages</h2>
            <p>Connect with agents and other users</p>
          </div>
          <button className="close-drawer-btn" onClick={() => setShowDrawer(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-actions">
            <button className="new-chat-btn" onClick={handleNewChat}>
              <Plus size={18} />
              New Chat
            </button>
          </div>

          <div className="chats-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading conversations...</p>
              </div>
            ) : chats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <MessageCircle size={48} />
                </div>
                <h3>No Conversations</h3>
                <p>Start a new chat to connect with others</p>
                <button className="btn-primary" onClick={handleNewChat}>
                  <Plus size={18} />
                  Start Chat
                </button>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = getOtherUser(chat);
                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="chat-avatar">
                      <img
                        src={otherUser?.avatar || getDefaultAvatar(otherUser?.username)}
                        alt={otherUser?.username}
                      />
                      {isUserOnline(otherUser?.id) && (
                        <div className="online-indicator">
                          <span className="online-dot"></span>
                        </div>
                      )}
                      {unreadCounts[chat.id] > 0 && (
                        <div className="unread-badge">
                          <span>{unreadCounts[chat.id]}</span>
                        </div>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <span className="username">{otherUser?.username || "Unknown User"}</span>
                        <span className="time">{formatTime(chat.updatedAt)}</span>
                      </div>
                      <div className="chat-preview">
                        <p className="last-message">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="header-left">
                <button className="drawer-toggle" onClick={() => setShowDrawer(true)}>
                  <Menu size={20} />
                </button>
                <div className="header-user">
                  <div className="user-avatar">
                    <img
                      src={getOtherUser(selectedChat)?.avatar || getDefaultAvatar(getOtherUser(selectedChat)?.username)}
                      alt={getOtherUser(selectedChat)?.username}
                    />
                    {isUserOnline(getOtherUser(selectedChat)?.id) && (
                      <div className="online-indicator">
                        <span className="online-dot"></span>
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="username">{getOtherUser(selectedChat)?.username}</span>
                    <span className={`status ${isUserOnline(getOtherUser(selectedChat)?.id) ? 'online' : 'offline'}`}>
                      {isUserOnline(getOtherUser(selectedChat)?.id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="header-actions">
                <button className="menu-btn" onClick={() => setShowChatMenu(!showChatMenu)}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <div className="empty-icon">
                    <MessageCircle size={48} />
                  </div>
                  <h3>No Messages Yet</h3>
                  <p>Start the conversation by sending a message</p>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${message.userId === currentUser.id ? 'own' : 'other'}`}
                    >
                      <div className="message-content">
                        <div className="message-bubble">
                          <p>{message.text}</p>
                          <div className="message-meta">
                            <span className="time">
                              <Clock size={12} />
                              {formatTime(message.createdAt)}
                            </span>
                            {message.userId === currentUser.id && (
                              <span className="status">
                                {message.isOptimistic ? (
                                  <div className="sending-indicator"></div>
                                ) : (
                                  <CheckCheck size={12} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="message-actions">
                          {message.userId === currentUser.id ? (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMessage(message.id)}
                              disabled={deletingMessage === message.id || message.isOptimistic}
                              title="Delete message"
                            >
                              {deletingMessage === message.id ? (
                                <div className="loading-dots"></div>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          ) : (
                            <button
                              className="hide-btn"
                              onClick={() => handleHideMessage(message.id)}
                              title="Hide message"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span>Someone is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="message-input">
              <div className="input-container">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                    handleTextareaResize();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  disabled={sendingMessage}
                />
                <button 
                  className="send-btn" 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <MessageCircle size={64} />
              </div>
              <h3>Select a Conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
              <button className="btn-primary" onClick={() => setShowDrawer(true)}>
                <Users size={18} />
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start New Chat</h2>
              <button className="close-btn" onClick={() => setShowNewChatModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="users-list">
                {usersLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <User size={32} />
                    </div>
                    <p>{searchQuery ? 'No users found' : 'No users available'}</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="user-item"
                    >
                      <div className="user-info" onClick={() => handleStartChat(user.id)}>
                        <div className="user-avatar">
                          <img
                            src={user.avatar || getDefaultAvatar(user.username)}
                            alt={user.username}
                          />
                          {isUserOnline(user.id) && (
                            <div className="online-indicator">
                              <span className="online-dot"></span>
                            </div>
                          )}
                        </div>
                        <div className="user-details">
                          <span className="username">{user.username}</span>
                          <span className="email">{user.email}</span>
                        </div>
                      </div>
                      <button
                        className="remove-user-btn"
                        onClick={() => handleRemoveUser(user.id)}
                        title="Remove from list"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={() => setShowDrawer(false)}></div>
      )}
    </div>
  );
}

export default Chat;