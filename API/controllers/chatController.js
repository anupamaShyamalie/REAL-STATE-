// controllers/chatController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new chat between two users
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: {
          hasEvery: [currentUserId, userId]
        }
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [currentUserId, userId],
        seenBy: currentUserId
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Update users' chatIDs
    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        chatIDs: {
          push: newChat.id
        }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        chatIDs: {
          push: newChat.id
        }
      }
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all chats for current user
export const getChats = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          has: currentUserId
        }
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get messages for a specific chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.userId;

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIDs: {
          has: currentUserId
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        chat: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log('sendMessage called with body:', req.body);
    console.log('sendMessage called with params:', req.params);
    const { text } = req.body;
    const { chatId } = req.params;
    const currentUserId = req.userId;

    console.log('Extracted values:', { chatId, text, currentUserId });

    if (!chatId || !text) {
      console.log('Validation failed:', { chatId, text });
      return res.status(400).json({ message: 'Chat ID and text are required' });
    }

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIDs: {
          has: currentUserId
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        text,
        userId: currentUserId,
        chatId
      },
      include: {
        chat: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    // Update chat's last message and seenBy
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: text,
        seenBy: currentUserId
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.userId;

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIDs: {
          has: currentUserId
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Update chat's seenBy
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        seenBy: currentUserId
      }
    });

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.userId;

    // Find the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            users: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is part of the chat
    const isUserInChat = message.chat.users.some(user => user.id === currentUserId);
    if (!isUserInChat) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Only allow users to delete their own messages
    if (message.userId !== currentUserId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Hide message from user's view (delete from my chat)
export const hideMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.userId;

    // Find the message and verify user is part of the chat
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            users: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is part of the chat
    const isUserInChat = message.chat.users.some(user => user.id === currentUserId);
    if (!isUserInChat) {
      return res.status(403).json({ message: 'Not authorized to hide this message' });
    }

    // For now, we'll just return success - the hiding will be handled client-side
    res.status(200).json({ message: 'Message hidden successfully' });
  } catch (error) {
    console.error('Error hiding message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (for starting new chats)
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.userId
        }
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        email: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};