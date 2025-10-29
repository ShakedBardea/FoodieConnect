import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jqueryAPI from '../../services/jqueryAPI';
import Loading from '../Common/Loading';
import RecipeSearch from './RecipeSearch';
import './Recipes.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  const fetchRecipes = () => {
    setLoading(true);
    const apiCall = Object.keys(filters).length > 0
      ? jqueryAPI.recipe.searchRecipes(filters)
      : jqueryAPI.recipe.getRecipes();
    
    apiCall
      .done((response) => {
        setRecipes(response.recipes || response);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching recipes:', error);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
  };

  if (loading) return <Loading message="Loading delicious recipes..." />;

  return (
    <div className="recipe-list-container">
      <h1 className="page-title">Discover Amazing Recipes</h1>
      
      <RecipeSearch onSearch={handleSearch} />

      <div className="recipes-grid">
        {recipes.map(recipe => (
          <Link to={`/recipes/${recipe._id}`} key={recipe._id} className="recipe-card">
            <div className="recipe-image">
              {recipe.images && recipe.images[0] ? (
                <>
                  <img 
                    src={recipe.images[0]} 
                    alt={recipe.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="recipe-placeholder" style={{ display: 'none' }}>
                    <div className="placeholder-icon">🍽️</div>
                  </div>
                </>
              ) : (
                <div className="recipe-placeholder">
                  <div className="placeholder-icon">🍽️</div>
                  <div className="placeholder-text">No Image</div>
                </div>
              )}
            </div>
            <div className="recipe-info">
              <h3>{recipe.title}</h3>
              {recipe.author && (
                <p className="recipe-author" style={{ margin: '6px 0', color: '#666', fontSize: '0.9em' }}>
                  By {recipe.author.fullName || recipe.author.username}
                </p>
              )}
              <p className="recipe-cuisine">{recipe.cuisine} • {recipe.difficulty}</p>
              <div className="recipe-meta">
                <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                <span>❤️ {recipe.likes?.length || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="no-results">
          <p>No recipes found. Try different filters!</p>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
