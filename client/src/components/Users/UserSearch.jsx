import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './Users.css';

const UserSearch = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: ''
  });
  const [friends, setFriends] = useState([]);

  const fetchUsers = useCallback((searchParams = {}) => {
    setLoading(true);
    jqueryAPI.auth.searchUsers(searchParams)
      .done((response) => {
        const allUsers = response.users || response || [];
        // Filter out current user
        const otherUsers = allUsers.filter(u => u._id !== user?._id);
        setUsers(otherUsers);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching users:', error);
        setUsers([]);
      })
      .always(() => {
        setLoading(false);
      });
  }, [user?._id]);

  const fetchFriends = useCallback(() => {
    if (!user) return;
    
    jqueryAPI.auth.getFriends()
      .done((response) => {
        const friendsList = response.friends || response || [];
        setFriends(friendsList);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching friends:', error);
        setFriends([]);
      });
  }, [user]);

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, [fetchUsers, fetchFriends]);

  const handleSearch = () => {
    const searchParams = {
      search: searchTerm,
      location: filters.location,
      experience: filters.experience
    };
    
    // Remove empty parameters
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });
    
    fetchUsers(searchParams);
  };

  const handleAddFriend = (userId) => {
    jqueryAPI.auth.addFriend(userId)
      .done((response) => {
        alert('Friend request sent!');
        fetchFriends();
      })
      .fail((xhr, status, error) => {
        const errorMessage = xhr.responseJSON?.message || 'Failed to send friend request';
        alert(errorMessage);
      });
  };

  const handleRemoveFriend = (userId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      jqueryAPI.auth.removeFriend(userId)
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

  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  const isPendingFriend = (userId) => {
    return friends.some(friend => friend._id === userId && friend.status === 'pending');
  };

  return (
    <div className="user-search-container">
      <h2>Find Foodie Friends</h2>
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, username, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.experience}
            onChange={(e) => setFilters(prev => ({...prev, experience: e.target.value}))}
          >
            <option value="">All Experience Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Professional">Professional</option>
          </select>
        </div>

        <button onClick={handleSearch} className="btn-search">
          Search
        </button>
      </div>

      {loading && <div className="loading">Searching...</div>}

      <div className="users-grid">
        {users.map(userItem => (
          <div key={userItem._id} className="user-card">
            <div className="user-avatar">
              <div className="avatar-placeholder">
                {userItem.fullName?.charAt(0) || userItem.username?.charAt(0) || '?'}
              </div>
            </div>
            
            <div className="user-info">
              <h3>{userItem.fullName || userItem.username}</h3>
              <p className="user-bio">{userItem.bio}</p>
              <p className="user-location">📍 {userItem.location}</p>
            </div>
            
            <div className="user-actions">
              {/* Only show friend actions for regular users */}
              {user?.role === 'user' ? (
                isFriend(userItem._id) ? (
                  <button 
                    className="btn-remove-friend"
                    onClick={() => handleRemoveFriend(userItem._id)}
                  >
                    Remove Friend
                  </button>
                ) : isPendingFriend(userItem._id) ? (
                  <button className="btn-pending" disabled>
                    Request Sent
                  </button>
                ) : (
                  <button 
                    className="btn-add-friend"
                    onClick={() => handleAddFriend(userItem._id)}
                  >
                    Add Friend
                  </button>
                )
              ) : (
                <span className="no-action">No actions available</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="no-users">
          <p>No users found. Try different search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
