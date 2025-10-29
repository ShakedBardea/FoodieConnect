import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import jqueryAPI from '../../services/jqueryAPI';
import './MyRecipes.css';

const MyRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?._id) {
        setError('User not found');
        return;
      }

      const response = await jqueryAPI.recipe.getUserRecipes(user._id);
      setRecipes(response || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setError('Failed to load your recipes');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchMyRecipes();
    }
  }, [user?._id, fetchMyRecipes]);

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await jqueryAPI.recipe.deleteRecipe(recipeId);
        setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
      } catch (error) {
        console.error('Failed to delete recipe:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="my-recipes">
        <div className="recipes-header">
          <h2>My Recipes</h2>
        </div>
        <div className="loading">Loading your recipes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-recipes">
        <div className="recipes-header">
          <h2>My Recipes</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="my-recipes">
        <div className="recipes-header">
          <h2>My Recipes</h2>
        </div>
        <div className="empty-recipes">
          <p>You haven't created any recipes yet.</p>
          <Link to="/recipes/create" className="create-recipe-btn">
            Create Your First Recipe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-recipes">
      <div className="recipes-header">
        <h2>My Recipes</h2>
        <p>Manage and edit your recipes</p>
      </div>

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <div className="recipe-image">
              {recipe.images && recipe.images.length > 0 ? (
                <img 
                  src={recipe.images[0]} 
                  alt={recipe.title}
                  onError={(e) => {
                    console.log('Image failed to load:', recipe.images[0]);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="recipe-image-placeholder"
                style={{ display: recipe.images && recipe.images.length > 0 ? 'none' : 'flex' }}
              >
                <div className="placeholder-icon">🍽️</div>
                <div className="placeholder-text">No Image</div>
              </div>
            </div>
            
            <div className="recipe-content">
              <h3 className="recipe-title">{recipe.title}</h3>
              <p className="recipe-description">
                {recipe.description && recipe.description.length > 100 
                  ? `${recipe.description.substring(0, 100)}...` 
                  : recipe.description || 'No description available'}
              </p>
              
              <div className="recipe-meta">
                <span className="recipe-category">{recipe.category}</span>
                <span className="recipe-cuisine">{recipe.cuisine}</span>
                <span className="recipe-difficulty">{recipe.difficulty}</span>
              </div>
              
              <div className="recipe-stats">
                <span>⏱️ {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                <span>👥 {recipe.servings || 1} servings</span>
              </div>
              
              <div className="recipe-date">
                Created: {formatDate(recipe.createdAt)}
              </div>
            </div>

            <div className="recipe-actions">
              <Link to={`/recipes/${recipe._id}`} className="view-btn">
                View
              </Link>
              <Link to={`/recipes/${recipe._id}/edit`} className="edit-btn">
                Edit
              </Link>
              <button 
                onClick={() => handleDeleteRecipe(recipe._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRecipes;
