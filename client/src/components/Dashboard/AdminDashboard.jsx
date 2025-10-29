import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import GroupAdminPanel from '../Admin/GroupAdminPanel';
import { PopularRecipesChart, ActivityTimelineChart } from './Statistics';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [popularData, setPopularData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, recipesRes] = await Promise.all([
          jqueryAPI.stats.getOverview(),
          jqueryAPI.recipe.getUserRecipes(user._id)
        ]);
        setRecentRecipes((recipesRes.data || recipesRes || []).slice(0, 5));
      } catch (e) {
        console.error('AdminDashboard: failed to load header data', e);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    // Load D3 statistics for admin dashboard
    const loadStats = async () => {
      try {
        const [popularRes, activityRes] = await Promise.all([
          jqueryAPI.stats.getPopularRecipes(),
          jqueryAPI.stats.getActivityTimeline()
        ]);
        const popular = popularRes.data?.data || popularRes.data || popularRes;
        const activity = activityRes.data?.data || activityRes.data || activityRes;
        setPopularData(Array.isArray(popular) ? popular : (popular?.data || []));
        setActivityData(Array.isArray(activity) ? activity : (activity?.data || []));
      } catch (e) {
        console.error('AdminDashboard: failed to load charts data', e);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {user.fullName}! 👋</h1>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Your Recipes</h2>
          {recentRecipes.length > 0 ? (
            <div className="recipes-list">
              {recentRecipes.map(recipe => (
                <div key={recipe._id} className="recipe-card">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No recipes yet. <a href="/recipes/create">Create your first recipe!</a></p>
          )}
        </div>
      </div>

      {/* Admin statistics (D3 charts) */}
      <div className="dashboard-section">
        <h2>Statistics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Top 5 Most Liked Recipes</h3>
            <PopularRecipesChart data={popularData} />
          </div>
          <div className="chart-card">
            <h3>Popular Cuisine Types</h3>
            <ActivityTimelineChart data={activityData} />
          </div>
        </div>
      </div>

      {/* Below: full admin panel with groups management */}
      <GroupAdminPanel />
    </div>
  );
};

export default AdminDashboard;


