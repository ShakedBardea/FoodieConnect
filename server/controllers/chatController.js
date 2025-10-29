const ChatMessage = require('../models/ChatMessage');

// @desc    Get unread messages count for current user
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCount = await ChatMessage.countDocuments({
      receiver: currentUserId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get chat history between two users
// @route   GET /api/chat/:userId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'username fullName profilePicture')
      .populate('receiver', 'username fullName profilePicture')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await ChatMessage.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const message = await ChatMessage.create({
      sender: req.user._id,
      receiver: req.params.userId,
      message: req.body.message
    });

    await message.populate('sender', 'username fullName profilePicture');
    await message.populate('receiver', 'username fullName profilePicture');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all conversations (list of users chatted with)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    console.log('Getting conversations for user:', userId, 'role:', userRole);
    const User = require('../models/User');
    const Group = require('../models/Group');

    // Get all contacts for this user
    let allContacts = [];

    // 1. Get friends (for all users)
    const currentUser = await User.findById(userId).populate('friends.user', 'username fullName profilePicture');
    console.log('Current user found:', !!currentUser);
    if (currentUser) {
      const friends = currentUser.friends.filter(f => f.status === 'accepted');
      console.log('Friends count:', friends.length);
      allContacts = [...friends.map(f => f.user)];
    }

    // 2. Get group-related contacts
    if (userRole === 'group_admin') {
      // For group admins: get members from ALL groups they manage
      const managedGroups = await Group.find({ admin: userId }).populate('members', 'username fullName profilePicture');
      console.log('Managed groups count:', managedGroups.length);
      
      managedGroups.forEach(group => {
        const groupMembers = group.members.filter(member => member._id.toString() !== userId.toString());
        console.log('Group members count for group', group.name, ':', groupMembers.length);
        groupMembers.forEach(member => {
          // Add if not already in contacts
          if (!allContacts.some(contact => contact._id.toString() === member._id.toString())) {
            allContacts.push(member);
          }
        });
      });
    }
    
    // For ALL users (including group admins): also get group admins from groups they're members of
    const userGroups = await Group.find({ members: userId }).populate('admin', 'username fullName profilePicture');
    console.log('User groups count:', userGroups.length);
    
    userGroups.forEach(group => {
      if (group.admin && group.admin._id.toString() !== userId.toString()) {
        // Add group admin if not already in contacts
        if (!allContacts.some(contact => contact._id.toString() === group.admin._id.toString())) {
          allContacts.push(group.admin);
        }
      }
    });
    
    console.log('Total contacts found:', allContacts.length);

    // 3. Get conversation data for all contacts
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageDate: { $first: '$createdAt' },
          isRead: { $first: '$isRead' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          fullName: '$user.fullName',
          profilePicture: '$user.profilePicture',
          lastMessage: 1,
          lastMessageDate: 1,
          isRead: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      }
    ]);

    // Create a map of existing conversations
    const conversationMap = new Map();
    conversations.forEach(conv => {
      conversationMap.set(conv._id.toString(), conv);
    });

    // Combine all contacts with their conversation data
    const result = allContacts.map(contact => {
      const contactId = contact._id.toString();
      const conversation = conversationMap.get(contactId);
      
      if (conversation) {
        // Contact has conversation history
        return {
          _id: contact._id,
          username: contact.username,
          fullName: contact.fullName,
          profilePicture: contact.profilePicture,
          lastMessage: conversation.lastMessage,
          lastMessageDate: conversation.lastMessageDate,
          isRead: conversation.isRead,
          unreadCount: conversation.unreadCount
        };
      } else {
        // Contact has no conversation history yet
        return {
          _id: contact._id,
          username: contact.username,
          fullName: contact.fullName,
          profilePicture: contact.profilePicture,
          lastMessage: null,
          lastMessageDate: null,
          isRead: true,
          unreadCount: 0
        };
      }
    });

    // Sort by last message date (contacts with conversations first, then by name)
    result.sort((a, b) => {
      if (a.lastMessageDate && b.lastMessageDate) {
        return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
      } else if (a.lastMessageDate && !b.lastMessageDate) {
        return -1;
      } else if (!a.lastMessageDate && b.lastMessageDate) {
        return 1;
      } else {
        return a.fullName.localeCompare(b.fullName);
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Mark messages as read
// @route   PUT /api/chat/:userId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await ChatMessage.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getConversations,
  getUnreadCount,
  markAsRead
};
