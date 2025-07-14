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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { currentUser } = useContext(AuthContext);
  const { 
    socket, 
    joinChat, 
    leaveChat, 
    sendMessage, 
    markAsRead, 
    startTyping, 
    stopTyping,
    isUserOnline 
  } = useSocket();

  // Fetch user's chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await apiRequest.get('/chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleReceiveMessage = (message) => {
      if (selectedChat && message.chatId === selectedChat.id) {
        setMessages(prev => [...prev, message]);
        // Mark message as read if chat is active
        markAsRead(selectedChat.id, [message.id]);
      }
      
      // Update chat list with latest message
      setChats(prev => prev.map(chat => 
        chat.id === message.chatId 
          ? { ...chat, lastMessage: message.content, lastMessageAt: message.createdAt }
          : chat
      ));
    };

    // Listen for typing indicators
    const handleUserTyping = ({ userId, username, isTyping }) => {
      if (selectedChat) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== userId);
          return isTyping ? [...filtered, { userId, username }] : filtered;
        });
      }
    };

    // Listen for messages marked as read
    const handleMessagesRead = ({ messageIds, readBy }) => {
      if (readBy !== currentUser.id) {
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        ));
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, selectedChat, currentUser, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      joinChat(selectedChat.id);
      
      return () => {
        leaveChat(selectedChat.id);
        setTypingUsers([]);
      };
    }
  }, [selectedChat, joinChat, leaveChat]);

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const response = await apiRequest.get(`/messages/${chatId}`);
      setMessages(response.data);
      
      // Mark unread messages as read
      const unreadMessages = response.data.filter(msg => 
        !msg.read && msg.receiverId === currentUser.id
      );
      
      if (unreadMessages.length > 0) {
        markAsRead(chatId, unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      chatId: selectedChat.id,
      receiverId: selectedChat.participants.find(p => p.id !== currentUser.id)?.id,
      senderId: currentUser.id,
      message: newMessage.trim()
    };

    // Add message to local state immediately for better UX
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      read: false,
      sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    stopTyping(selectedChat.id);

    // Send via socket
    sendMessage(messageData);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && selectedChat) {
      setIsTyping(true);
      startTyping(selectedChat.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedChat) {
        stopTyping(selectedChat.id);
      }
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p.id !== currentUser.id);
  };

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats.map(chat => {
          const otherUser = getOtherUser(chat);
          const isOnline = isUserOnline(otherUser?.id);
          
          return (
            <div 
              key={chat.id}
              className={`message ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="avatar-container">
                <img
                  src={otherUser?.avatar || "https://cdn.pixabay.com/photo/2024/01/27/07/32/ai-generated-8535467_1280.jpg"}
                  alt={otherUser?.username}
                />
                {isOnline && <div className="online-indicator"></div>}
              </div>
              <div className="message-info">
                <span className="username">{otherUser?.username}</span>
                <p className="last-message">
                  {chat.lastMessage || "Start a conversation..."}
                </p>
                {chat.lastMessageAt && (
                  <span className="timestamp">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedChat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <div className="avatar-container">
                <img
                  src={getOtherUser(selectedChat)?.avatar || "https://cdn.pixabay.com/photo/2024/01/27/07/32/ai-generated-8535467_1280.jpg"}
                  alt={getOtherUser(selectedChat)?.username}
                />
                {isUserOnline(getOtherUser(selectedChat)?.id) && (
                  <div className="online-indicator"></div>
                )}
              </div>
              <div className="user-info">
                <span className="username">{getOtherUser(selectedChat)?.username}</span>
                {isUserOnline(getOtherUser(selectedChat)?.id) && (
                  <span className="status">Online</span>
                )}
              </div>
            </div>
            <span className="close" onClick={() => setSelectedChat(null)}>×</span>
          </div>

          <div className="center">
            {loading ? (
              <div className="loading">Loading messages...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`chatMessage ${message.senderId === currentUser.id ? 'own' : ''}`}
                  >
                    <p>{message.content}</p>
                    <div className="message-meta">
                      <span className="timestamp">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.senderId === currentUser.id && (
                        <span className={`read-status ${message.read ? 'read' : 'unread'}`}>
                          {message.sending ? '⏳' : message.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <div className="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">
                      {typingUsers.map(user => user.username).join(', ')} 
                      {typingUsers.length === 1 ? ' is' : ' are'} typing...
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="bottom">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;