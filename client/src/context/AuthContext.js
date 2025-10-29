import React, { createContext, useState, useContext, useEffect } from 'react';
import jqueryAPI from '../services/jqueryAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUser = () => {
      if (token) {
        jqueryAPI.auth.getProfile()
          .done((response) => {
            setUser(response);
          })
          .fail((xhr, status, error) => {
            console.error('Failed to load user profile', { status: xhr?.status, error });
            // Do not logout here to avoid login loops; keep last known user
          })
          .always(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);


  const login = (email, password) => {
    return new Promise((resolve) => {
      jqueryAPI.auth.login({ email, password })
        .done((response) => {
          const { token, ...userData } = response;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setToken(token);
          // Immediately validate token by loading profile to avoid race conditions
          jqueryAPI.auth.getProfile()
            .done((profile) => {
              setUser(profile || userData);
              resolve({ success: true, user: profile || userData });
            })
            .fail((xhr, status, error) => {
              console.error('Post-login profile load failed', { status: xhr?.status, error });
              // Fall back to userData from login response
              setUser(userData);
              resolve({ success: true, user: userData });
            });
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Login failed';
          resolve({ 
            success: false, 
            error: errorMessage
          });
        });
    });
  };

  const register = (userData) => {
    return new Promise((resolve) => {
      jqueryAPI.auth.register(userData)
        .done((response) => {
          const { token, ...user } = response;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          setToken(token);
          setUser(user);
          
          resolve({ success: true });
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Registration failed';
          resolve({ 
            success: false, 
            error: errorMessage
          });
        });
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    unreadCount,
    updateUnreadCount,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
