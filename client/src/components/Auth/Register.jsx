import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './Auth.css';
import { triggerConfetti } from '../Canvas/Confetti';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerAsGroupAdmin, setRegisterAsGroupAdmin] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false
  });
  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      // Celebrate on any successful registration (even for regular users)
      triggerConfetti({ durationMs: 1400 });
      const goToDashboard = () => navigate('/dashboard');
      const goToFeed = () => navigate('/feed');

      const refreshProfile = () => new Promise((resolve) => {
        jqueryAPI.auth.getProfile()
          .done((profile) => { updateUser(profile); resolve(profile); })
          .fail(() => resolve(null));
      });

      try {
        if (registerAsGroupAdmin) {
          // Basic client-side validation for group fields
          if (!groupData.name || !groupData.description) {
            setError('Please fill group name and description');
            setLoading(false);
            return;
          }
          // Create group immediately; server will set role to group_admin
          await new Promise((resolve, reject) => {
            jqueryAPI.group.createGroup({
              name: groupData.name,
              description: groupData.description,
              category: groupData.category || 'Other',
              isPrivate: !!groupData.isPrivate
            })
            .done(() => resolve())
            .fail((xhr) => reject(xhr));
          });
          const prof = await refreshProfile();
          // As a safety net, if the server update was delayed, set role locally
          if (!prof || prof.role !== 'group_admin') {
            const local = JSON.parse(localStorage.getItem('user') || '{}');
            const patched = { ...local, role: 'group_admin' };
            localStorage.setItem('user', JSON.stringify(patched));
            updateUser(patched);
          }
          // Celebrate
          triggerConfetti({ durationMs: 1800 });
          return goToDashboard();
        }
      } catch (e) {
        console.error('Group creation after register failed:', e);
        // Even if group creation failed, continue to profile appropriate page
      }
      // Non-admin registration → go to feed
      goToFeed();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🍽️ FoodieConnect</h1>
        <h2>Join Our Community!</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Bio (Optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              id="register-as-group-admin"
              type="checkbox"
              checked={registerAsGroupAdmin}
              onChange={(e) => setRegisterAsGroupAdmin(e.target.checked)}
            />
            <label htmlFor="register-as-group-admin" style={{ margin: 0 }}>
              Register as Group Admin (create your group now)
            </label>
          </div>

          {registerAsGroupAdmin && (
            <div className="card" style={{ marginTop: '10px' }}>
              <h4 style={{ marginBottom: '10px' }}>Create Your Group</h4>
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  value={groupData.name}
                  onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="3"
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={groupData.category}
                  onChange={(e) => setGroupData({ ...groupData, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {[
                    'Italian Cooking','Asian Cuisine','Vegan','Vegetarian','Baking','Healthy Eating','Quick Meals','Fine Dining','BBQ & Grilling','Desserts','International','Other'
                  ].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  id="group-is-private"
                  type="checkbox"
                  checked={groupData.isPrivate}
                  onChange={(e) => setGroupData({ ...groupData, isPrivate: e.target.checked })}
                />
                <label htmlFor="group-is-private" style={{ margin: 0 }}>Private group (requires approval to join)</label>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
