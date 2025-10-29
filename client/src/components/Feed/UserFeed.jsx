import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import jqueryAPI from '../../services/jqueryAPI';
import './UserFeed.css';

const UserFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    fetchUserFeed();
  }, [currentPage]);

  const fetchUserFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      jqueryAPI.group.getUserFeed({ page: currentPage, limit: 10 })
        .done((response) => {
          setPosts(response.posts || []);
          setTotalPages(response.totalPages || 0);
          setUserGroups(response.userGroups || []);
        })
        .fail((xhr) => {
          setError(xhr.responseJSON?.message || 'Failed to load feed');
        })
        .always(() => {
          setLoading(false);
        });
    } catch (error) {
      setError('Failed to load feed');
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };



  if (loading && posts.length === 0) {
    return (
      <div className="user-feed">
        <div className="feed-header">
          <h2>Your Feed</h2>
        </div>
        <div className="loading">Loading your feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-feed">
        <div className="feed-header">
          <h2>Your Feed</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="user-feed">
        <div className="feed-header">
          <h2>Your Feed</h2>
        </div>
        <div className="empty-feed">
          <p>No posts yet! Join some groups to see posts in your feed.</p>
          {userGroups.length === 0 && (
            <p>You're not a member of any groups yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="user-feed">
      <div className="feed-header">
        <h2>Your Feed</h2>
        <p>Posts from your groups: {userGroups.map(g => g.name).join(', ')}</p>
      </div>

      <div className="posts-container">
        {posts.map((post) => (
          <div key={post._id} className="recipe-card">
            <div className="recipe-image-section">
              {post.recipe.images && post.recipe.images.length > 0 ? (
                <img 
                  src={post.recipe.images[0]} 
                  alt={post.recipe.title}
                  className="recipe-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="recipe-image-placeholder" style={{ display: post.recipe.images && post.recipe.images.length > 0 ? 'none' : 'flex' }}>
                <div className="placeholder-icon">🍽️</div>
                <div className="placeholder-text">No Image</div>
              </div>
              <div className="recipe-author-overlay">
                <img 
                  src={post.recipe?.author?.profilePicture || 'https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=32'} 
                  alt={post.recipe?.author?.username}
                  className="author-avatar-small"
                />
                <span className="author-name">{post.recipe?.author?.fullName || post.recipe?.author?.username}</span>
              </div>
            </div>
            
            <div className="recipe-details-section">
              <h3 className="recipe-title">{post.recipe.title}</h3>
              <div className="recipe-meta">
                <span className="recipe-category">{post.recipe.category}</span>
                <span className="recipe-cuisine">{post.recipe.cuisine}</span>
                <span className="recipe-difficulty">{post.recipe.difficulty}</span>
              </div>
              <div className="recipe-stats">
                <span>⏱️ {(post.recipe.prepTime || 0) + (post.recipe.cookTime || 0)} min</span>
                <span>👥 {post.recipe.servings || 1} servings</span>
              </div>
              <div className="recipe-actions">
                <Link to={`/recipes/${post.recipe._id}`} className="view-recipe-btn">
                  View Full Recipe
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFeed;
