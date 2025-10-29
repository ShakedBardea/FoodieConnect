import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './Users.css';

const FriendsList = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    // Only fetch friends for regular users
    if (user?.role === 'user') {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  // Group admins don't have friends - they only manage group members
  if (user?.role === 'group_admin') {
    return (
      <div className="friends-list-container">
        <h2>Administrator Panel</h2>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>As an administrator, you don't have personal friends.</p>
          <p>You manage group members through your <strong>Group Admin Panel</strong>.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fetchFriends = () => {
    setLoading(true);
    jqueryAPI.auth.getFriends()
      .done((response) => {
        const friendsList = response.friends || response || [];
        if (Array.isArray(friendsList)) {
          // The backend already filters for accepted friends, so we don't need to filter again
          setFriends(friendsList);
        } else {
          setFriends([]);
        }
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching friends:', error);
        setFriends([]);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const fetchPendingRequests = () => {
    jqueryAPI.auth.getPendingRequests()
      .done((response) => {
        const pendingList = response.requests || response || [];
        if (Array.isArray(pendingList)) {
          setPendingRequests(pendingList);
        } else {
          setPendingRequests([]);
        }
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching pending requests:', error);
        setPendingRequests([]);
      });
  };

  const handleAcceptRequest = (requestId) => {
    jqueryAPI.auth.acceptFriendRequest(requestId)
      .done((response) => {
        alert('Friend request accepted!');
        fetchFriends();
        fetchPendingRequests();
      })
      .fail((xhr, status, error) => {
        const errorMessage = xhr.responseJSON?.message || 'Failed to accept friend request';
        alert(errorMessage);
      });
  };

  const handleRejectRequest = (requestId) => {
    if (window.confirm('Are you sure you want to reject this friend request?')) {
      jqueryAPI.auth.rejectFriendRequest(requestId)
        .done((response) => {
          alert('Friend request rejected!');
          fetchPendingRequests();
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to reject friend request';
          alert(errorMessage);
        });
    }
  };

  const handleRemoveFriend = (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      jqueryAPI.auth.removeFriend(friendId)
        .done((response) => {
          alert('Friend removed!');
          fetchFriends();
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to remove friend';
          alert(errorMessage);
        });
    }
  };

  return (
    <div className="friends-list-container">
      <h2>My Friends</h2>
      
      <div className="friends-tabs">
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="friends-section">
          {loading ? (
            <div className="loading">Loading friends...</div>
          ) : friends.length > 0 ? (
            <div className="friends-grid">
              {friends.map(friend => (
                <div key={friend._id} className="friend-card">
                  <div className="friend-avatar">
                    <div className="avatar-placeholder">
                      {friend.user?.fullName?.charAt(0) || friend.user?.username?.charAt(0) || '?'}
                    </div>
                  </div>
                  
                  <div className="friend-info">
                    <h3>{friend.user?.fullName || friend.user?.username || 'Unknown User'}</h3>
                    <p className="friend-bio">{friend.user?.bio || 'No bio available'}</p>
                    <p className="friend-location">📍 {friend.user?.location || 'No location'}</p>
                  </div>
                  
                  <div className="friend-actions">
                    <button 
                      className="btn-remove-friend"
                      onClick={() => handleRemoveFriend(friend._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-friends">
              <p>You don't have any friends yet. Start by searching for foodie friends!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-section">
          {pendingRequests.length > 0 ? (
            <div className="pending-grid">
              {pendingRequests.map(request => (
                <div key={request._id} className="pending-card">
                  <div className="pending-avatar">
                    <div className="avatar-placeholder">
                      {request.user?.fullName?.charAt(0) || request.user?.username?.charAt(0) || '?'}
                    </div>
                  </div>
                  
                  <div className="pending-info">
                    <h3>{request.user?.fullName || request.user?.username || 'Unknown User'}</h3>
                    <p className="pending-bio">{request.user?.bio || 'No bio available'}</p>
                    <p className="pending-location">📍 {request.user?.location || 'No location'}</p>
                  </div>
                  
                  <div className="pending-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-pending">
              <p>No pending friend requests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
