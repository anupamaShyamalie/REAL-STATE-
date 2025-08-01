import { useState, useEffect, useRef, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import "./chat.scss";

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket, joinChat, leaveChat, sendMessage, startTyping, stopTyping, isUserOnline, markNotificationsAsRead } = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      if (!selectedChat || message.chatId !== selectedChat.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1
        }));
      }
      // Update chat list with new message
      setChats(prev => prev.map(chat => 
        chat.id === message.chatId 
          ? { ...chat, lastMessage: message.text }
          : chat
      ));
    };

    socket.on("newMessage", handleNewMessage);

    // Listen for typing indicators
    socket.on("userTyping", ({ chatId, userId }) => {
      if (selectedChat && chatId === selectedChat.id) {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
      }
    });

    socket.on("userStopTyping", ({ chatId, userId }) => {
      if (selectedChat && chatId === selectedChat.id) {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket, selectedChat]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (selectedChat) {
      setUnreadCounts(prev => ({
        ...prev,
        [selectedChat.id]: 0
      }));
    }
  }, [selectedChat]);

  // Join/leave chat rooms
  useEffect(() => {
    if (selectedChat && socket) {
      joinChat(selectedChat.id);
      return () => {
        leaveChat(selectedChat.id);
      };
    }
  }, [selectedChat, socket, joinChat, leaveChat]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setTypingUsers([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage; // Store the message text before clearing
    console.log('Sending message via socket:', { chatId: selectedChat.id, text: messageText, userId: currentUser.id });

    try {
      // Send message via socket for real-time (this will trigger notifications)
      sendMessage({
        chatId: selectedChat.id,
        text: messageText,
        userId: currentUser.id
      });

      // Add message to local state immediately for instant feedback
      const tempMessage = {
        id: Date.now(), // Temporary ID
        text: messageText,
        userId: currentUser.id,
        chatId: selectedChat.id,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(selectedChat.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || deletingMessage === messageId) return;

    try {
      setDeletingMessage(messageId);
      await apiRequest.delete(`/chat/messages/${messageId}`);
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Update chat list if this was the last message
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat.id) {
          const remainingMessages = messages.filter(msg => msg.id !== messageId);
          return {
            ...chat,
            lastMessage: remainingMessages.length > 0 
              ? remainingMessages[remainingMessages.length - 1].text 
              : "No messages yet"
          };
        }
        return chat;
      }));
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleHideMessage = async (messageId) => {
    if (!messageId) return;

    try {
      await apiRequest.post(`/chat/messages/${messageId}/hide`);
      
      // Add message to hidden messages set
      setHiddenMessages(prev => new Set([...prev, messageId]));
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error hiding message:", error);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;

    startTyping(selectedChat.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat.id);
    }, 1000);
  };

  const handleNewChat = async () => {
    setShowNewChatModal(true);
    setUsersLoading(true);
    setSearchQuery("");
    
    try {
      console.log("Fetching users...");
      const response = await apiRequest.get("/users");
      console.log("Users response:", response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      // Check if chat already exists with this user
      const existingChat = chats.find(chat => 
        chat.users.some(user => user.id === userId)
      );

      if (existingChat) {
        // If chat exists, just select it
        setSelectedChat(existingChat);
        setShowNewChatModal(false);
        return;
      }

      // Create new chat
      const response = await apiRequest.post("/chat", { userId });
      const newChat = response.data;
      
      // Add new chat to the list
      setChats(prev => [newChat, ...prev]);
      
      // Select the new chat
      setSelectedChat(newChat);
      setShowNewChatModal(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleRemoveUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setFilteredUsers(prev => prev.filter(user => user.id !== userId));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor((now - date) / (1000 * 60))}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherUser = (chat) => {
    return chat.users.find(user => user.id !== currentUser.id);
  };

  return (
    <div className="chat">
      <div className="messages">
        <div className="messages-header">
          <h1>Messages</h1>
          <button className="new-chat-btn" onClick={handleNewChat}>
            New Chat
          </button>
        </div>
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="no-chats">No conversations yet</div>
        ) : (
          chats.map((chat) => {
            const otherUser = getOtherUser(chat);
            return (
              <div
                key={chat.id}
                className={`message ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="user-info">
                  <img
                    src={otherUser?.avatar || "https://cdn.pixabay.com/photo/2024/01/27/07/32/ai-generated-8535467_1280.jpg"}
                    alt={otherUser?.username}
                  />
                  {/* Unread badge */}
                  {unreadCounts[chat.id] > 0 && (
                    <span className="unread-badge">{unreadCounts[chat.id]}</span>
                  )}
                  <div className="online-indicator">
                    {isUserOnline(otherUser?.id) && <span className="online-dot"></span>}
                  </div>
                </div>
                <div className="message-content">
                  <span className="username">{otherUser?.username || "Unknown User"}</span>
                  <p className="last-message">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedChat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={getOtherUser(selectedChat)?.avatar || "https://cdn.pixabay.com/photo/2024/01/27/07/32/ai-generated-8535467_1280.jpg"}
                alt={getOtherUser(selectedChat)?.username}
              />
              <div className="user-info">
                <span className="username">{getOtherUser(selectedChat)?.username}</span>
                <span className={`status ${isUserOnline(getOtherUser(selectedChat)?.id) ? 'online' : 'offline'}`}>
                  {isUserOnline(getOtherUser(selectedChat)?.id) ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <span className="close" onClick={() => setSelectedChat(null)}>×</span>
          </div>

          <div className="center">
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatMessage ${message.userId === currentUser.id ? 'own' : ''}`}
                >
                                      <div className="message-content">
                      <p>{message.text}</p>
                      <div className="message-actions">
                        <span className="time">{formatTime(message.createdAt)}</span>
                        <div className="action-buttons">
                          {message.userId === currentUser.id ? (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMessage(message.id)}
                              disabled={deletingMessage === message.id}
                              title="Delete message"
                            >
                              {deletingMessage === message.id ? 'Deleting...' : '×'}
                            </button>
                          ) : (
                            <button
                              className="hide-btn"
                              onClick={() => handleHideMessage(message.id)}
                              title="Delete from my chat"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span>Someone is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bottom">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start New Chat</h2>
              <button className="close-btn" onClick={() => setShowNewChatModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              {usersLoading ? (
                <div className="loading">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="no-users">
                  {searchQuery ? 'No users found' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-item"
                  >
                    <div className="user-info" onClick={() => handleStartChat(user.id)}>
                      <img
                        src={user.avatar || "https://cdn.pixabay.com/photo/2024/01/27/07/32/ai-generated-8535467_1280.jpg"}
                        alt={user.username}
                      />
                      <div className="user-details">
                        <span className="username">{user.username}</span>
                        <span className="email">{user.email}</span>
                      </div>
                      <div className="online-indicator">
                        {isUserOnline(user.id) && <span className="online-dot"></span>}
                      </div>
                    </div>
                    <button
                      className="remove-user-btn"
                      onClick={() => handleRemoveUser(user.id)}
                      title="Remove from list"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;