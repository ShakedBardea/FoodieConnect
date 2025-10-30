import $ from 'jquery';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// jQuery AJAX wrapper functions
class JQueryAPI {
  constructor() {
    this.setupAjaxDefaults();
  }

  setupAjaxDefaults() {
    // Set default headers and error handling
    $.ajaxSetup({
      beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Content-Type', 'application/json');
      },
      error: function(xhr, status, error) {
        // Handle 401 Unauthorized errors (expired/invalid tokens)
        if (xhr.status === 401) {
          // Clear invalid token and user data from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Notify user that session has expired
          alert('Session expired. Please login again.');
        }
        console.error('AJAX Error:', error);
      }
    });
  }

  // Generic AJAX methods
  get(url, data = {}) {
    return $.ajax({
      url: `${API_URL}${url}`,
      method: 'GET',
      data: data,
      cache: false,
      dataType: 'json',
      beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }
    });
  }

  post(url, data = {}) {
    return $.ajax({
      url: `${API_URL}${url}`,
      method: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }
    });
  }

  put(url, data = {}) {
    return $.ajax({
      url: `${API_URL}${url}`,
      method: 'PUT',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }
    });
  }

  delete(url) {
    return $.ajax({
      url: `${API_URL}${url}`,
      method: 'DELETE',
      dataType: 'json',
      beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }
    });
  }

  // Auth API
  auth = {
    register: (data) => this.post('/users/register', data),
    login: (data) => this.post('/users/login', data),
    getProfile: () => this.get('/users/profile'),
    updateProfile: (data) => this.put('/users/profile', data),
    getUsers: (params) => this.get('/users', params),
    searchUsers: (params) => this.get('/users/search', params),
    getUserById: (id) => this.get(`/users/${id}`),
    addFriend: (userId) => this.post(`/users/friends/${userId}`),
    removeFriend: (userId) => this.delete(`/users/friends/${userId}`),
    getFriends: () => this.get('/users/friends'),
    getPendingRequests: () => this.get('/users/friends/pending'),
    acceptFriendRequest: (requestId) => this.post(`/users/friends/accept/${requestId}`),
    rejectFriendRequest: (requestId) => this.post(`/users/friends/reject/${requestId}`)
  };

  // Recipe API
  recipe = {
    getRecipes: (params) => this.get('/recipes', params),
    searchRecipes: (params) => this.get('/recipes/search', params),
    getRecipeById: (id) => this.get(`/recipes/${id}`),
    createRecipe: (data) => this.post('/recipes', data),
    updateRecipe: (id, data) => this.put(`/recipes/${id}`, data),
    deleteRecipe: (id) => this.delete(`/recipes/${id}`),
    toggleLike: (id) => this.post(`/recipes/${id}/like`),
    addComment: (id, data) => this.post(`/recipes/${id}/comments`, data),
    deleteComment: (id, commentId) => this.delete(`/recipes/${id}/comments/${commentId}`),
    getUserRecipes: (userId) => this.get(`/recipes/user/${userId}`),
    getGroupRecipes: (groupId) => this.get(`/recipes/group/${groupId}`),
    getPopularRecipes: () => this.get('/recipes/popular')
  };

  // Group API
  group = {
    getGroups: (params) => this.get('/groups', params),
    searchGroups: (params) => this.get('/groups/search', params),
    getGroupById: (id) => this.get(`/groups/${id}`),
    createGroup: (data) => this.post('/groups', data),
    updateGroup: (id, data) => this.put(`/groups/${id}`, data),
    deleteGroup: (id) => this.delete(`/groups/${id}`),
    joinGroup: (id) => this.post(`/groups/${id}/join`),
    leaveGroup: (id) => this.post(`/groups/${id}/leave`),
    getPendingRequests: (groupId) => this.get(`/groups/${groupId}/pending-requests`),
    approveRequest: (groupId, userId) => this.post(`/groups/${groupId}/approve/${userId}`),
    rejectRequest: (groupId, userId) => this.post(`/groups/${groupId}/reject/${userId}`),
    removeMember: (groupId, userId) => this.delete(`/groups/${groupId}/members/${userId}`),
    createPost: (groupId, data) => this.post(`/groups/${groupId}/posts`, data),
    deletePost: (groupId, postId) => this.delete(`/groups/${groupId}/posts/${postId}`),
    // Group recipes
    createRecipe: (groupId, data) => this.post(`/groups/${groupId}/recipes`, data),
    // moderation endpoints removed
    // User feed and interactions
    getUserFeed: (params) => this.get('/groups/feed', params),
    togglePostLike: (groupId, postId) => this.post(`/groups/${groupId}/posts/${postId}/like`),
    addPostComment: (groupId, postId, data) => this.post(`/groups/${groupId}/posts/${postId}/comments`, data),
    deletePostComment: (groupId, postId, commentId) => this.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`),
    getUserGroups: () => this.get('/groups/user/my-groups')
  };

  // Chat API
  chat = {
    getChatHistory: (userId) => this.get(`/chat/${userId}`),
    sendMessage: (userId, data) => this.post(`/chat/${userId}`, data),
    getConversations: () => this.get('/chat/conversations'),
    getUnreadCount: () => this.get('/chat/unread-count'),
    markAsRead: (userId) => this.put(`/chat/${userId}/read`)
  };

  // Stats API
  stats = {
    getPopularRecipes: () => this.get('/stats/popular-recipes'),
    getActivityTimeline: () => this.get('/stats/activity-timeline'),
    getCuisineDistribution: () => this.get('/stats/cuisine-distribution'),
    getOverview: () => this.get('/stats/overview'),
    getGroupCategories: () => this.get('/stats/group-categories')
  };
}

// Create and export singleton instance
const jqueryAPI = new JQueryAPI();
export default jqueryAPI;
