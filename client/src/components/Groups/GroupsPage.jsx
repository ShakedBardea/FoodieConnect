import React, { useState, useEffect } from 'react';
 
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import Loading from '../Common/Loading';
import io from 'socket.io-client';
import './Groups.css';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userGroups, setUserGroups] = useState([]);

  const categories = [
    'Italian Cooking',
    'Asian Cuisine',
    'Vegan',
    'Vegetarian',
    'Baking',
    'Healthy Eating',
    'Quick Meals',
    'Fine Dining',
    'BBQ & Grilling',
    'Desserts',
    'International',
    'Other'
  ];

  useEffect(() => {
    fetchGroups();
    fetchUserGroups();
    
    // Setup Socket.IO connection for real-time updates
    if (user) {
      const socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });
      
      socket.emit('user_online', user._id);
      
      // Listen for group deletion notifications
      socket.on('group_deleted', (data) => {
        alert(`Group Deleted: ${data.message}`);
        // Refresh groups list to remove deleted group
        fetchGroups();
        fetchUserGroups();
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Auto-search when category changes
  useEffect(() => {
    if (selectedCategory) {
      handleSearch();
    }
  }, [selectedCategory]);

  // Auto-search when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);


  const fetchGroups = (searchParams = {}) => {
    setLoading(true);
    // Using jQuery AJAX instead of async/await
    jqueryAPI.group.getGroups(searchParams)
      .done((response) => {
        console.log('Groups jQuery API response:', response);
        // The API returns { groups: [...], totalPages: ..., currentPage: ..., total: ... }
        const groupsArray = response.groups || response || [];
        setGroups(Array.isArray(groupsArray) ? groupsArray : []);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching groups:', error);
        setGroups([]); // Set empty array on error
      })
      .always(() => {
        setLoading(false);
      });
  };

  const fetchUserGroups = () => {
    if (!user) return;
    
    jqueryAPI.group.getUserGroups()
      .done((response) => {
        const userGroupsArray = response.data || response || [];
        setUserGroups(Array.isArray(userGroupsArray) ? userGroupsArray : []);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching user groups:', error);
        setUserGroups([]);
      });
  };

  const handleJoinGroup = (groupId) => {
    if (!user) {
      alert('Please login to join groups');
      return;
    }

    jqueryAPI.group.joinGroup(groupId)
      .done((response) => {
        alert(response.message || 'Successfully joined group!');
        fetchGroups(); // Refresh groups list
        fetchUserGroups(); // Refresh user groups
      })
      .fail((xhr, status, error) => {
        const errorMessage = xhr.responseJSON?.message || 'Failed to join group';
        alert(errorMessage);
      });
  };

  const handleLeaveGroup = (groupId) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to leave this group?')) {
      jqueryAPI.group.leaveGroup(groupId)
        .done((response) => {
          alert(response.message || 'Successfully left group!');
          fetchGroups(); // Refresh groups list
          fetchUserGroups(); // Refresh user groups
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to leave group';
          alert(errorMessage);
        });
    }
  };

  const isUserInGroup = (groupId) => {
    return userGroups.some(userGroup => userGroup._id === groupId);
  };

  const handleSearch = () => {
    const searchParams = {
      category: selectedCategory,
      search: searchTerm
    };
    
    // Remove empty parameters
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });
    
    fetchGroups(searchParams);
  };

  

  if (loading) return <Loading />;

  return (
    <div className="groups-page">
      <div className="groups-header">
        <h1>Food Groups</h1>
        <p>Join communities of food lovers and share your culinary experiences</p>
      </div>

      <div className="groups-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          Search
        </button>
      </div>


      <div className="groups-grid">
        {groups.length > 0 ? (
          groups.map(group => (
            <div key={group._id} className="group-card">
              <div className="group-cover">
                <img 
                  src={group.coverImage || `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center`} 
                  alt={group.name}
                  onError={(e) => {
                    e.target.src = `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center`;
                  }}
                />
                <div className="group-category">{group.category}</div>
              </div>
              
              <div className="group-content">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                
                <div className="group-stats">
                  <span>{group.memberCount || group.members?.length || 0} members</span>
                  <span className={`privacy ${group.isPrivate ? 'private' : 'public'}`}>
                    {group.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                
                <div className="group-actions">
                  {isUserInGroup(group._id) ? (
                    // Don't show Leave Group button for group admin
                    group.admin._id !== user._id ? (
                      <button 
                        className="btn-leave" 
                        onClick={() => handleLeaveGroup(group._id)}
                      >
                        Leave Group
                      </button>
                    ) : (
                      <span className="admin-badge">Group Admin</span>
                    )
                  ) : (
                    (() => {
                      const pending = Array.isArray(group.pendingRequests)
                        ? group.pendingRequests.some(pr => (pr?._id || pr)?.toString() === user._id)
                        : false;
                      return pending ? (
                        <button className="btn-join" disabled>
                          Request Pending
                        </button>
                      ) : (
                        <button 
                          className="btn-join" 
                          onClick={() => handleJoinGroup(group._id)}
                        >
                          {group.isPrivate ? 'Request to Join' : 'Join Group'}
                        </button>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-groups">
            <h3>No groups found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
