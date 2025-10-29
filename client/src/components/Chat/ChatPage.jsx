import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import ChatBox from './ChatBox';
import Loading from '../Common/Loading';
import './Chat.css';

const ChatPage = () => {
  const { user, updateUnreadCount } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchUsers();
    
    // Refresh conversations every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update navbar when entering chat page
  useEffect(() => {
    if (users.length > 0) {
      const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
      updateUnreadCount(totalUnread);
    }
  }, [unreadCounts, updateUnreadCount]);




  const fetchUsers = async () => {
    try {
      // Get conversations from server (includes all relevant contacts)
      const response = await jqueryAPI.chat.getConversations();
      const conversations = response.conversations || response || [];
      
      // Extract users from conversations
      const usersFromConversations = conversations
        .map(conv => ({
          _id: conv._id,
          username: conv.username,
          fullName: conv.fullName,
          profilePicture: conv.profilePicture
        }))
        // remove duplicates by username (sometimes the API can return duplicates)
        .filter((u, idx, arr) => arr.findIndex(x => x.username === u.username) === idx);

      setUsers(usersFromConversations);
      
      // Set unread counts
      const counts = {};
      let totalUnread = 0;
      conversations.forEach(conv => {
        if (conv.unreadCount > 0) {
          counts[conv.username] = conv.unreadCount;
          totalUnread += conv.unreadCount;
        }
      });
      setUnreadCounts(counts);
      updateUnreadCount(totalUnread);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Clear unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [user.username]: 0
    }));
    
    // Update total unread count in navbar
    const newCounts = {
      ...unreadCounts,
      [user.username]: 0
    };
    const totalUnread = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
    updateUnreadCount(totalUnread);
  };

  const handleChatOpened = () => {
    // Refresh unread counts when chat is opened
    fetchUsers();
  };

  if (loading) return <Loading />;

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2>Conversations</h2>
        <div className="users-list">
          {users.map(user => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user.fullName}
                  {unreadCounts[user.username] > 0 && (
                    <span className="unread-dot"></span>
                  )}
                </div>
                <div className="user-username">@{user.username}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <ChatBox
            receiverId={selectedUser._id}
            receiverName={selectedUser.fullName}
            onMessageReceived={(message) => {
              // Add unread count for the sender of the message
              const senderUsername = message.sender?.username || message.senderId;
              console.log('Message received from:', senderUsername, 'Current chat:', selectedUser?.username);
              
              // Only add unread count if:
              // 1. The message is not from the currently selected user
              // 2. The message is not from the current user (self)
              if (senderUsername && 
                  senderUsername !== selectedUser?.username && 
                  senderUsername !== user?.username) {
                setUnreadCounts(prev => {
                  const newCounts = {
                    ...prev,
                    [senderUsername]: (prev[senderUsername] || 0) + 1
                  };
                  console.log('Updated unread counts:', newCounts);
                  return newCounts;
                });
              }
            }}
            onChatOpened={() => {
              if (selectedUser) {
                setUnreadCounts(prev => ({
                  ...prev,
                  [selectedUser.username]: 0
                }));
                // Refresh conversations to update navbar
                fetchUsers();
              }
            }}

            />
        ) : (
          <div className="no-chat-selected">
            <h2>Select a user to start chatting</h2>
            <p>Choose from the list on the left</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
