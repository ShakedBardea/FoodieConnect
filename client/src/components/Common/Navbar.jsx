import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './Common.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, unreadCount, updateUnreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Load unread messages count
  useEffect(() => {
    if (isAuthenticated) {
      const loadUnreadCount = async () => {
        try {
          const response = await jqueryAPI.chat.getUnreadCount();
          updateUnreadCount(response.unreadCount);
        } catch (error) {
          console.error('Failed to load unread count:', error);
        }
      };

      loadUnreadCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, updateUnreadCount]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">FoodieConnect</span>
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              {/* Main Navigation - Only Essential Links */}
              <Link 
                to="/recipes" 
                className={`nav-link ${isActive('/recipes') ? 'active' : ''}`}
              >
                <span className="nav-icon">📖</span>
                Recipes
              </Link>
              
              <Link 
                to="/groups" 
                className={`nav-link ${isActive('/groups') ? 'active' : ''}`}
              >
                <span className="nav-icon">👥</span>
                Groups
              </Link>
              
              <Link 
                to="/feed" 
                className={`nav-link ${isActive('/feed') ? 'active' : ''}`}
              >
                <span className="nav-icon">📰</span>
                Feed
              </Link>
              
              {/* Create Recipe Button - Only for regular users */}
              {user?.role === 'user' && (
                <Link 
                  to="/recipes/create" 
                  className={`nav-link create-recipe ${isActive('/recipes/create') ? 'active' : ''}`}
                >
                  <span className="nav-icon">➕</span>
                  Create
                </Link>
              )}
              
              {/* User Menu with All Other Options */}
              <div className="nav-user-section">
                <div className="user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="user-avatar">
                    <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="user-name">{user?.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link 
                      to="/profile/edit" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </Link>
                    <Link 
                      to="/my-recipes" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="dropdown-icon">🍽️</span>
                      My Recipes
                    </Link>
                    {/* Find Friends - Only for regular users */}
                    {user?.role === 'user' && (
                      <Link 
                        to="/users/search" 
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="dropdown-icon">🔍</span>
                        Find Friends
                      </Link>
                    )}
                    <Link 
                      to="/chat" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="dropdown-icon">💬</span>
                      Chat
                      {unreadCount > 0 && (
                        <span className="notification-dot"></span>
                      )}
                    </Link>
                    {/* Friends - Only for regular users */}
                    {user?.role === 'user' && (
                      <Link 
                        to="/friends" 
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="dropdown-icon">👥</span>
                        Friends
                      </Link>
                    )}
                    {user?.role === 'group_admin' && (
                      <Link 
                        to="/dashboard" 
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="dropdown-icon">📊</span>
                        Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <span className="nav-icon">🔑</span>
                Login
              </Link>
              <Link to="/register" className="btn-nav-register">
                <span className="nav-icon">✨</span>
                Join Us
              </Link>
            </>
          )}
        </div>

        <button 
          className={`nav-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
