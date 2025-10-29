import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import Loading from '../Common/Loading';
import GroupMemberManagement from './GroupMemberManagement';
import GroupRecipeManager from './GroupRecipeManager';
import io from 'socket.io-client';
import './GroupAdminPanel.css';

const GroupAdminPanel = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-groups');
  const [editingGroup, setEditingGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showRecipeManager, setShowRecipeManager] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [topRecipes, setTopRecipes] = useState([]);

  

  useEffect(() => {
    fetchAllGroups();
    if (!user) return;
    // Setup Socket.IO connection for notifications
    const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(apiBase, { transports: ['websocket', 'polling'] });
    newSocket.emit('user_online', user._id);
    newSocket.on('group_join_request', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'group_join_request',
        groupId: data.groupId,
        groupName: data.groupName,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: new Date()
      }]);
    });
    return () => newSocket.close();
  }, [user]);

  // System-level charts are moved to SystemAdminDashboard

  useEffect(() => {
    if (user) fetchGlobalAdminStats();
  }, [user, groups.length]);

  const fetchAllGroups = () => {
    setLoading(true);
    if (user?.role === 'group_admin') {
      // Show only groups that this admin owns
      jqueryAPI.group.getUserGroups()
        .done((response) => {
          const myGroups = (response.data || response || []).filter(g => (g.admin?._id || g.admin) === user._id);
          setGroups(Array.isArray(myGroups) ? myGroups : []);
        })
        .fail((xhr, status, error) => {
          console.error('Error fetching my groups (admin panel):', error);
          setGroups([]);
        })
        .always(() => {
          setLoading(false);
        });
    } else {
      // Fallback: fetch all groups (if system admin role existed)
      jqueryAPI.group.getGroups({ page: 1, limit: 50 })
        .done((response) => {
          const groupsArray = response.groups || response || [];
          setGroups(Array.isArray(groupsArray) ? groupsArray : []);
        })
        .fail((xhr, status, error) => {
          console.error('Error fetching groups (admin panel):', error);
          setGroups([]);
        })
        .always(() => {
          setLoading(false);
        });
    }
  };

  

  const fetchGlobalAdminStats = async () => {
    if (!user) return;
    try {
      const userRecipesRes = await jqueryAPI.recipe.getUserRecipes(user._id);
      const userRecipes = Array.isArray(userRecipesRes) ? userRecipesRes : (userRecipesRes.data || []);

      const myGroupsRes = await jqueryAPI.group.getUserGroups();
      const myGroups = (myGroupsRes.data || myGroupsRes || []).filter(g => (g.admin?._id || g.admin) === user._id);

      let pendingTotal = 0;
      if (myGroups.length > 0) {
        const details = await Promise.all(
          myGroups.map(g => jqueryAPI.group.getGroupById(g._id).catch(() => null))
        );
        pendingTotal = details.reduce((sum, gd) => sum + (gd?.pendingRequests?.length || 0), 0);
      }

      setGroupStats({
        totalRecipes: userRecipes.length,
        totalPosts: 0,
        pendingRequests: pendingTotal,
        groupName: 'All Your Groups'
      });
    } catch (e) {
      console.error('Error fetching global admin stats:', e);
    }
  };

  const fetchGroupRecipes = (groupId) => {
    // Use dedicated API to get this group's recipes
    jqueryAPI.recipe.getGroupRecipes(groupId)
      .done((response) => {
        const allGroupRecipes = Array.isArray(response) ? response : (response.data || []);
        // Count only recipes created by the current group admin (compare as strings to avoid ObjectId vs string issues)
        const currentUserId = user?._id ? String(user._id) : '';
        const adminRecipes = allGroupRecipes.filter(r => {
          const authorId = r?.author?._id ?? r?.author;
          return authorId ? String(authorId) === currentUserId : false;
        });
        
        setGroupStats(prev => ({
          ...prev,
          totalRecipes: adminRecipes.length
        }));
        
        if (adminRecipes.length > 0) {
          const sortedRecipes = [...adminRecipes]
            .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
            .slice(0, 5);
          setTopRecipes(sortedRecipes);
        } else {
          setTopRecipes([]);
        }
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching group recipes:', error);
        setTopRecipes([]);
      });
  };


  const handleManageMembers = (groupId) => {
    setSelectedGroupId(groupId);
    fetchGlobalAdminStats();
    setShowMemberManagement(true);
  };

  const handleManageRecipes = (groupId) => {
    setSelectedGroupId(groupId);
    fetchGlobalAdminStats();
    setShowRecipeManager(true);
  };

  const handleCloseModal = () => {
    setShowMemberManagement(false);
    setShowRecipeManager(false);
    setSelectedGroupId(null);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleUpdateGroup = (groupId, groupData) => {
    jqueryAPI.group.updateGroup(groupId, groupData)
      .done((response) => {
        alert('Group updated successfully!');
        setEditingGroup(null);
        fetchAllGroups();
      })
      .fail((xhr, status, error) => {
        const errorMessage = xhr.responseJSON?.message || 'Failed to update group';
        alert(errorMessage);
      });
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      jqueryAPI.group.deleteGroup(groupId)
        .done((response) => {
          alert('Group deleted successfully!');
          fetchAllGroups();
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to delete group';
          alert(errorMessage);
        });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="group-admin-panel">
      {/* System-wide overview removed; focusing on group-specific stats below */}
      <div className="admin-header">
        <h1>Group Management</h1>
        <p>Manage your groups and their content</p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          <h3>Notifications ({notifications.length})</h3>
          {notifications.map(notification => (
            <div key={notification.id} className="notification-card">
              <div className="notification-content">
                <h4>{notification.message}</h4>
                <p>Group: {notification.groupName}</p>
                <p>User: {notification.userName}</p>
                <small>{notification.timestamp.toLocaleTimeString()}</small>
              </div>
              <div className="notification-actions">
                <button 
                  className="btn-manage"
                  onClick={() => handleManageMembers(notification.groupId)}
                >
                  Manage
                </button>
                <button 
                  className="btn-dismiss"
                  onClick={() => dismissNotification(notification.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group Statistics */}
      {groupStats && (
        <div className="group-stats-section">
          <h3>📊 Group Statistics </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{groupStats.totalRecipes}</div>
              <div className="stat-label">Recipes Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{groupStats.pendingRequests}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </div>
      )}

      {/* Group Admin - Top Recipes in This Group */}
      {user?.role === 'group_admin' && topRecipes.length > 0 && (
        <div className="top-recipes-section">
          <h3>🏆 Most Popular Recipes in Your Group</h3>
          <div className="top-recipes-list">
            {topRecipes.map((recipe, index) => (
              <div key={recipe._id} className="recipe-card">
                <div className="recipe-rank">#{index + 1}</div>
                <div className="recipe-info">
                  <h4>{recipe.title}</h4>
                  <p>{recipe.description}</p>
                  <div className="recipe-stats">
                    <span className="likes">❤️ {recipe.likes?.length || 0} likes</span>
                    <span className="category">🍽️ {recipe.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'my-groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-groups')}
        >
          All Groups ({groups.length})
        </button>
      </div>

      {activeTab === 'my-groups' && (
        <div className="groups-management">
          {groups.length > 0 ? (
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group._id} className="group-management-card">
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
                  
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    <div className="group-actions">
                      {group.admin?._id === user?._id ? (
                        <>
                          <button 
                            className="btn-edit"
                            onClick={() => setEditingGroup(group)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteGroup(group._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="admin-badge">Admin: {group.admin?.username || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="group-info">
                    <p className="group-description">{group.description}</p>
                    <div className="group-stats">
                      <span>Category: {group.category}</span>
                      <span>Members: {group.memberCount || group.members?.length || 0}</span>
                      <span className={`privacy ${group.isPrivate ? 'private' : 'public'}`}>
                        {group.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>

                  <div className="group-management-actions">
                    {group.admin?._id === user?._id ? (
                      <>
                        <button 
                          className="btn-manage-members"
                          onClick={() => handleManageMembers(group._id)}
                        >
                          Manage Join Requests
                        </button>
                        <button 
                          className="btn-manage-recipes"
                          onClick={() => handleManageRecipes(group._id)}
                        >
                          Add Recipes
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-manage"
                        onClick={() => setSelectedGroupId(group._id)}
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-groups">
              <h3>No groups found</h3>
              <p>You haven't created any groups yet. Create your first group to get started!</p>
              <button 
                className="btn-create-first"
                onClick={() => setActiveTab('create-group')}
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      )}


      {editingGroup && (
        <GroupEditForm 
          group={editingGroup}
          onSubmit={(data) => handleUpdateGroup(editingGroup._id, data)}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      {/* Modals */}
      {showMemberManagement && (
        <GroupMemberManagement 
          groupId={selectedGroupId} 
          onClose={handleCloseModal} 
        />
      )}

      {showRecipeManager && (
        <GroupRecipeManager 
          groupId={selectedGroupId} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};


// Group Edit Form Component
const GroupEditForm = ({ group, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group.name || '',
    description: group.description || '',
    category: group.category || '',
    isPrivate: group.isPrivate || false,
    rules: group.rules || [''],
    coverImage: group.coverImage || ''
  });

  const categories = [
    'Italian Cooking', 'Asian Cuisine', 'Vegan', 'Vegetarian', 'Baking',
    'Healthy Eating', 'Quick Meals', 'Fine Dining', 'BBQ & Grilling',
    'Desserts', 'International', 'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty rules
    const filteredRules = formData.rules.filter(rule => rule.trim() !== '');
    
    onSubmit({
      ...formData,
      rules: filteredRules
    });
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const updateRule = (index, value) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="group-form-modal">
      <div className="group-form">
        <h2>Edit Group</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter group name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Describe your group"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image URL</label>
            <input
              type="url"
              id="coverImage"
              value={formData.coverImage}
              onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            <small>Add a cover image URL for your group. You can use free image services like Unsplash.</small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              Private Group (requires approval to join)
            </label>
          </div>

          <div className="form-group">
            <label>Group Rules</label>
            {formData.rules.map((rule, index) => (
              <div key={index} className="rule-input">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder="Enter a group rule"
                />
                {formData.rules.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-remove-rule"
                    onClick={() => removeRule(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-rule"
              onClick={addRule}
            >
              + Add Rule
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Update Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupAdminPanel;
