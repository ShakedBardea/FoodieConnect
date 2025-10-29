import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './CreateRecipe.css';

const CreateRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    cuisine: '',
    difficulty: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    isPrivate: false,
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
    images: [],
    tags: ''
  });

  // Load recipe data for editing
  useEffect(() => {
    if (isEditMode && id) {
      fetchRecipe();
    }
  }, [id, isEditMode, user?._id]);

  const fetchRecipe = async () => {
    try {
      setInitialLoading(true);
      const response = await jqueryAPI.recipe.getRecipeById(id);
      
      // Check if user owns this recipe
      if (response.author._id !== user?._id) {
        setMessage('You can only edit your own recipes');
        setTimeout(() => navigate('/my-recipes'), 2000);
        return;
      }

      setFormData({
        title: response.title || '',
        description: response.description || '',
        category: response.category || '',
        cuisine: response.cuisine || '',
        difficulty: response.difficulty || '',
        prepTime: response.prepTime || '',
        cookTime: response.cookTime || '',
        servings: response.servings || '',
        isPrivate: response.isPrivate || false,
        ingredients: response.ingredients?.length > 0 ? response.ingredients : [{ name: '', amount: '', unit: '' }],
        instructions: response.instructions?.length > 0 ? response.instructions : [''],
        images: response.images || [],
        tags: response.tags?.join(', ') || ''
      });
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      setMessage('Failed to load recipe');
      setTimeout(() => navigate('/my-recipes'), 2000);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        instructions: newInstructions
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Clean up empty ingredients and instructions
      const cleanedIngredients = formData.ingredients.filter(ing => ing.name.trim() !== '');
      const cleanedInstructions = formData.instructions.filter(inst => inst.trim() !== '');
      
      // Check if we have at least one ingredient and instruction
      if (cleanedIngredients.length === 0) {
        setMessage('Error: At least one ingredient is required');
        setLoading(false);
        return;
      }
      
      if (cleanedInstructions.length === 0) {
        setMessage('Error: At least one instruction is required');
        setLoading(false);
        return;
      }
      
      // Convert tags string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const recipeData = {
        ...formData,
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 1,
        ingredients: cleanedIngredients,
        instructions: cleanedInstructions,
        tags: tagsArray
      };

      if (isEditMode) {
        await jqueryAPI.recipe.updateRecipe(id, recipeData);
        setMessage('Recipe updated successfully!');
        setTimeout(() => {
          navigate('/my-recipes');
        }, 2000);
      } else {
        await jqueryAPI.recipe.createRecipe(recipeData);
        setMessage('Recipe created successfully!');
        setTimeout(() => {
          navigate('/recipes');
        }, 2000);
      }
    } catch (error) {
      setMessage('Error creating recipe: ' + (error.responseJSON?.message || error.message));
    }
    setLoading(false);
  };

  if (!user) {
    return <div>Please login to create recipes.</div>;
  }

  if (initialLoading) {
    return (
      <div className="create-recipe-container">
        <div className="loading">Loading recipe...</div>
      </div>
    );
  }

  return (
    <div className="create-recipe-container">
      <div className="create-recipe-header">
        <h1>{isEditMode ? '✏️ Edit Recipe' : '🍳 Create New Recipe'}</h1>
        <p>Share your culinary masterpiece with the FoodieConnect community!</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-recipe-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Recipe Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Grandma's Chocolate Chip Cookies"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Main Dish">Main Dish</option>
                <option value="Dessert">Dessert</option>
                <option value="Side Dish">Side Dish</option>
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cuisine">Cuisine</label>
              <select
                id="cuisine"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Cuisine</option>
                <option value="Italian">Italian</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Mexican">Mexican</option>
                <option value="American">American</option>
                <option value="French">French</option>
                <option value="Indian">Indian</option>
                <option value="Middle Eastern">Middle Eastern</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder="Describe your recipe, what makes it special..."
            />
          </div>
        </div>

        {/* Time & Servings */}
        <div className="form-section">
          <h2>Time & Servings</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleInputChange}
                min="0"
                placeholder="15"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleInputChange}
                min="0"
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                min="1"
                placeholder="4"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              <span className="checkbox-text">Private Recipe (Only visible to you)</span>
            </label>
          </div>
        </div>

        {/* Ingredients */}
        <div className="form-section">
          <h2>Ingredients</h2>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <div className="form-group">
                <label>Ingredient Name</label>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="e.g., Flour"
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  placeholder="cups"
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn-remove"
                disabled={formData.ingredients.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="btn-add">
            + Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="form-section">
          <h2>Instructions</h2>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <div className="form-group">
                <label>Step {index + 1}</label>
                <textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  rows="2"
                  placeholder="Describe this step..."
                />
              </div>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="btn-remove"
                disabled={formData.instructions.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="btn-add">
            + Add Step
          </button>
        </div>


        {/* Images */}
        <div className="form-section">
          <h2>Recipe Images</h2>
          <div className="form-group">
            <label htmlFor="images">Image URLs (one per line)</label>
            <textarea
              id="images"
              name="images"
              value={formData.images ? formData.images.join('\n') : ''}
              onChange={(e) => {
                const urls = e.target.value.split('\n').filter(url => url.trim() !== '');
                setFormData(prev => ({ ...prev, images: urls }));
              }}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows="3"
            />
            <small>Add image URLs, one per line. You can use free image services like Unsplash.</small>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h2>Tags</h2>
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., vegetarian, quick, healthy, comfort food"
            />
            <small>Separate tags with commas. Popular tags: vegetarian, vegan, quick, healthy, comfort food, spicy, gluten-free</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(isEditMode ? '/my-recipes' : '/recipes')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (isEditMode ? 'Updating Recipe...' : 'Creating Recipe...') : (isEditMode ? 'Update Recipe' : 'Create Recipe')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;
