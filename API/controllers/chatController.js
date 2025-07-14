// controllers/chatController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all chats for the current user
export const getChats = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: req.userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format the response
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      participants: chat.participants.map(p => p.user),
      lastMessage: chat.messages[0]?.content || null,
      lastMessageAt: chat.messages[0]?.createdAt || chat.createdAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.status(200).json(formattedChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

// Get or create a chat between two users
export const createChat = async (req, res) => {
  const { receiverId } = req.body;

  try {
    // Check if chat already exists between these users
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: req.userId
              }
            }
          },
          {
            participants: {
              some: {
                userId: receiverId
              }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
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

    // If no chat exists, create a new one
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: req.userId },
              { userId: receiverId }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
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
    }

    // Format response
    const formattedChat = {
      id: chat.id,
      participants: chat.participants.map(p => p.user),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    };

    res.status(200).json(formattedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat!" });
  }
};

// Get messages for a specific chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  try {
    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: req.userId
          }
        }
      }
    });

    if (!chat) {
      return res.status(403).json({ message: "Not authorized to view this chat!" });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      skip: skip,
      take: limit
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
        receiverId: req.userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get messages!" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, receiverId, content } = req.body;

  try {
    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: req.userId
          }
        }
      }
    });

    if (!chat) {
      return res.status(403).json({ message: "Not authorized to send messages in this chat!" });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.userId,
        receiverId,
        chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Update chat's last message info
    await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message!" });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  const { messageIds } = req.body;

  try {
    await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds
        },
        receiverId: req.userId
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark messages as read!" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Verify the user is the sender of this message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: req.userId
      }
    });

    if (!message) {
      return res.status(403).json({ message: "Not authorized to delete this message!" });
    }

    await prisma.message.delete({
      where: {
        id: messageId
      }
    });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete message!" });
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