import React, { useState } from 'react';
import './Recipes.css';

const RecipeSearch = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    cuisine: '',
    difficulty: '',
    maxPrepTime: '',
    ingredients: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Align cuisine options with Recipe model enum
  const cuisines = [
    'Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'French', 'Indian', 'Middle Eastern', 'Other'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Clean up empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value.trim() !== '')
    );
    
    // Add search animation delay
    setTimeout(() => {
      onSearch(cleanFilters);
      setIsSearching(false);
      setSearchResults(cleanFilters);
    }, 800);
  };

  const handleClear = () => {
    setFilters({
      cuisine: '',
      difficulty: '',
      maxPrepTime: '',
      ingredients: ''
    });
    onSearch({});
    setSearchResults(null);
  };

  const quickSearch = (type, value) => {
    const quickFilter = { [type]: value };
    setFilters(prev => ({ ...prev, [type]: value }));
    onSearch(quickFilter);
  };

  return (
    <div className="recipe-search-container">
      <div className="search-header">
        <h2>Find Your Perfect Recipe</h2>
        <button 
          className="toggle-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Simple Search' : 'Advanced Search'}
        </button>
      </div>

      {/* Quick Search */}
      <div className="quick-search">
        <div className="quick-filters">
          <h3>Quick Filters:</h3>
          <div className="quick-buttons">
            {cuisines.slice(0, 6).map(cuisine => (
              <button
                key={cuisine}
                className={`quick-btn ${filters.cuisine === cuisine ? 'active' : ''}`}
                onClick={() => quickSearch('cuisine', cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Search Form */}
      {showAdvanced && (
        <form className="advanced-search-form" onSubmit={handleSearch}>
          <div className="search-row">
            <div className="search-field">
              <label htmlFor="cuisine">Cuisine Type:</label>
              <select
                id="cuisine"
                name="cuisine"
                value={filters.cuisine}
                onChange={handleInputChange}
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="difficulty">Difficulty Level:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleInputChange}
              >
                <option value="">Any Level</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label htmlFor="maxPrepTime">Max Prep Time (minutes):</label>
              <input
                type="number"
                id="maxPrepTime"
                name="maxPrepTime"
                value={filters.maxPrepTime}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="1"
                max="300"
              />
            </div>
          </div>

          <div className="search-row">
            <div className="search-field full-width">
              <label htmlFor="ingredients">Ingredients (comma-separated):</label>
              <input
                type="text"
                id="ingredients"
                name="ingredients"
                value={filters.ingredients}
                onChange={handleInputChange}
                placeholder="e.g., chicken, tomatoes, garlic"
              />
            </div>
          </div>



          <div className="search-actions">
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? (
                <>
                  <span className="search-spinner">⏳</span>
                  Searching...
                </>
              ) : (
                <>
                  🔍 Search Recipes
                </>
              )}
            </button>
            <button type="button" className="clear-btn" onClick={handleClear}>
              🗑️ Clear All
            </button>
          </div>
        </form>
      )}

      {/* Active Filters Display */}
      {searchResults && Object.keys(searchResults).length > 0 && (
        <div className="active-filters">
          <h4>🎯 Active Filters:</h4>
          <div className="filter-tags">
            {Object.entries(searchResults).map(([key, value]) => (
              <span key={key} className="filter-tag">
                {key}: {value}
                <button 
                  onClick={() => {
                    const newFilters = { ...filters, [key]: '' };
                    setFilters(newFilters);
                    const cleanFilters = Object.fromEntries(
                      Object.entries(newFilters).filter(([_, val]) => val.trim() !== '')
                    );
                    onSearch(cleanFilters);
                    setSearchResults(cleanFilters);
                  }}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="search-tips">
        <h4>💡 Search Tips:</h4>
        <ul>
          <li>Use ingredients to find recipes with specific items</li>
          <li>Combine multiple filters for precise results</li>
          <li>Try different cuisines to discover new flavors</li>
          <li>Set max prep time for quick meal planning</li>
        </ul>
      </div>
    </div>
  );
};

export default RecipeSearch;
