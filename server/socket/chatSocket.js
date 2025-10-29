const ChatMessage = require('../models/ChatMessage');

// Map to store online users: userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins (register their socket)
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} is online`);
      
      // Broadcast to all users that this user is online
      socket.broadcast.emit('user_status', { userId, status: 'online' });
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, message } = data;

        console.log('Saving message:', { senderId, receiverId, message });

        // Save message to database
        const chatMessage = await ChatMessage.create({
          sender: senderId,
          receiver: receiverId,
          message: message
        });

        console.log('Message saved:', chatMessage._id);

        await chatMessage.populate('sender', 'username fullName profilePicture');
        await chatMessage.populate('receiver', 'username fullName profilePicture');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', chatMessage);
        }

        // Confirm to sender
        socket.emit('message_sent', chatMessage);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: data.senderId,
          isTyping: true
        });
      }
    });

    socket.on('stop_typing', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: data.senderId,
          isTyping: false
        });
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        await ChatMessage.updateMany(
          {
            sender: data.senderId,
            receiver: data.receiverId,
            isRead: false
          },
          { isRead: true }
        );

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(data.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            readBy: data.receiverId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Group join request notifications
    socket.on('join_group_request', async (data) => {
      try {
        const { groupId, userId, groupName } = data;
        
        // Find group admin
        const Group = require('../models/Group');
        const group = await Group.findById(groupId).populate('admin', 'username');
        
        if (group && group.admin) {
          const adminSocketId = onlineUsers.get(group.admin._id.toString());
          if (adminSocketId) {
            io.to(adminSocketId).emit('group_join_request', {
              groupId,
              groupName,
              userId,
              message: `New join request for group: ${groupName}`
            });
          }
        }
      } catch (error) {
        console.error('Error sending group join request notification:', error);
      }
    });

    // User disconnects
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`👋 User ${socket.userId} disconnected`);
        
        // Broadcast to all users that this user is offline
        socket.broadcast.emit('user_status', { 
          userId: socket.userId, 
          status: 'offline' 
        });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Return helper function to check if user is online
  return {
    isUserOnline: (userId) => onlineUsers.has(userId),
    getOnlineUsers: () => Array.from(onlineUsers.keys())
  };
};

module.exports = setupSocket;
