import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import Loading from '../Common/Loading';
import './GroupRecipeManager.css';

// Helper functions for group restrictions
const getCategoriesForGroup = (groupCategory) => {
  switch (groupCategory) {
    case 'Italian Cooking':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    case 'Vegan':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    case 'Baking':
      return ['Dessert', 'Breakfast', 'Snack'];
    case 'Asian Cuisine':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    case 'Healthy Eating':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    case 'Quick Meals':
      return ['Main Dish', 'Appetizer', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    case 'Fine Dining':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish'];
    case 'BBQ & Grilling':
      return ['Main Dish', 'Appetizer', 'Side Dish'];
    case 'Desserts':
      return ['Dessert', 'Breakfast', 'Snack'];
    case 'International':
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
    default:
      return ['Main Dish', 'Appetizer', 'Dessert', 'Side Dish', 'Breakfast', 'Snack', 'Beverage'];
  }
};

const getCuisinesForGroup = (groupCategory) => {
  switch (groupCategory) {
    case 'Italian Cooking':
      return ['Italian'];
    case 'Vegan':
      return ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'French', 'Indian', 'Middle Eastern', 'Other']; // Vegan can be any cuisine
    case 'Vegetarian':
      return ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'French', 'Indian', 'Middle Eastern', 'Other']; // Vegetarian can be any cuisine
    case 'Baking':
      return ['Italian', 'French', 'American', 'Other'];
    case 'Asian Cuisine':
      return ['Asian', 'Other'];
    case 'Healthy Eating':
      return ['Mediterranean', 'Other'];
    case 'Quick Meals':
      return ['American', 'Italian', 'Other'];
    case 'Fine Dining':
      return ['French', 'Italian', 'Other'];
    case 'BBQ & Grilling':
      // Grilling is cross-cuisine: allow several common grilling traditions
      return ['American', 'Middle Eastern', 'Mexican', 'Asian', 'Other'];
    case 'Desserts':
      return ['French', 'Italian', 'American', 'Other'];
    case 'International':
      return ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'French', 'Indian', 'Middle Eastern', 'Other'];
    default:
      return ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'French', 'Indian', 'Middle Eastern', 'Other'];
  }
};

const getForbiddenIngredients = (groupCategory) => {
  switch (groupCategory) {
    case 'Italian Cooking':
      return ['Soy sauce', 'Ginger', 'Sesame oil', 'Fish sauce', 'Coconut milk', 'Curry powder', 'Tofu', 'Tempeh', 'Rice vinegar', 'Miso', 'Wasabi', 'Kimchi'];
    case 'Vegan':
      return ['Meat', 'Chicken', 'Beef', 'Pork', 'Fish', 'Seafood', 'Dairy', 'Milk', 'Cheese', 'Butter', 'Eggs', 'Honey', 'Gelatin', 'Whey', 'Casein'];
    case 'Baking':
      return ['Meat', 'Fish', 'Vegetables', 'Soy sauce', 'Ginger', 'Sesame oil', 'Raw fish', 'Seafood'];
    case 'Asian Cuisine':
      return ['Parmesan cheese', 'Mozzarella', 'Basil', 'Oregano', 'Tomato sauce', 'Olive oil', 'Balsamic vinegar', 'Feta cheese'];
    case 'Healthy Eating':
      return ['Processed foods', 'Fried foods', 'Sugary drinks', 'White flour', 'Refined sugar', 'Trans fats', 'Artificial preservatives', 'High sodium'];
    case 'Quick Meals':
      return ['Complex techniques', 'Long cooking times', 'Hard to find ingredients', 'Slow cooking', 'Fermentation'];
    case 'Fine Dining':
      return ['Processed foods', 'Fast food ingredients', 'Low quality ingredients', 'Instant mixes', 'Pre-made sauces'];
    case 'BBQ & Grilling':
      return ['Dairy-heavy dishes', 'Raw fish', 'Cold soups', 'Desserts without grilling', 'Boiled vegetables', 'Steamed foods'];
    case 'Desserts':
      return ['Meat', 'Fish', 'Vegetables', 'Soy sauce', 'Ginger', 'Sesame oil', 'Raw fish', 'Seafood', 'Savory spices'];
    case 'International':
      return []; // No restrictions for international
    default:
      return [];
  }
};

const GroupRecipeManager = ({ groupId, onClose }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await jqueryAPI.group.getGroupById(groupId);
      setGroup(response);
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateRecipe = async (recipeData) => {
    try {
      // Add group ID to recipe data
      const recipeWithGroup = {
        ...recipeData,
        group: groupId
      };
      
      const response = await jqueryAPI.group.createRecipe(groupId, recipeWithGroup);
      alert('Recipe created successfully!');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe');
    }
  };




  if (loading) return <Loading />;

  return (
    <div className="recipe-manager-modal">
      <div className="recipe-manager">
        <div className="modal-header">
          <h2>Manage Group Recipes</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="group-info">
          <h3>{group?.name}</h3>
          <p>Add and manage recipes for your group.</p>
        </div>

        <div className="recipe-manager-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              console.log('Button clicked!');
              setShowCreateForm(true);
            }}
          >
            + Add New Recipe
          </button>
        </div>


        {showCreateForm && (
          <div className="create-recipe-modal">
            <div className="create-recipe-content">
              <RecipeCreateForm
                onSubmit={handleCreateRecipe}
                onCancel={() => setShowCreateForm(false)}
                groupCategory={group?.category}
                getCategoriesForGroup={getCategoriesForGroup}
                getCuisinesForGroup={getCuisinesForGroup}
                getForbiddenIngredients={getForbiddenIngredients}
              />
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
};

// Recipe Create Form Component - Using CreateRecipe design
const RecipeCreateForm = ({ onSubmit, onCancel, groupCategory, getCategoriesForGroup, getCuisinesForGroup, getForbiddenIngredients }) => {
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
    tags: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // Validation functions
  const validateRecipe = () => {
    const errors = [];
    const warnings = [];

    // Check category restriction
    if (groupCategory && formData.category) {
      const allowedCategories = getCategoriesForGroup(groupCategory);
      if (!allowedCategories.includes(formData.category)) {
        errors.push(`Category "${formData.category}" is not allowed in ${groupCategory} group. Allowed categories: ${allowedCategories.join(', ')}`);
      }
    }

    // Check cuisine restriction
    if (groupCategory && formData.cuisine) {
      const allowedCuisines = getCuisinesForGroup(groupCategory);
      if (!allowedCuisines.includes(formData.cuisine)) {
        errors.push(`Cuisine "${formData.cuisine}" is not allowed in ${groupCategory} group. Allowed cuisines: ${allowedCuisines.join(', ')}`);
      }
    }

    // Check forbidden ingredients
    if (groupCategory && formData.ingredients) {
      const forbiddenIngredients = getForbiddenIngredients(groupCategory);
      const usedIngredients = formData.ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ing.name.toLowerCase());
      
      const foundForbidden = usedIngredients.filter(ingredient => 
        forbiddenIngredients.some(forbidden => 
          ingredient.includes(forbidden.toLowerCase()) || forbidden.toLowerCase().includes(ingredient)
        )
      );

      if (foundForbidden.length > 0) {
        errors.push(`Forbidden ingredients in ${groupCategory} group: ${foundForbidden.join(', ')}. Forbidden ingredients: ${forbiddenIngredients.join(', ')}`);
      }
    }

    // Check if recipe is too simple for Fine Dining
    if (groupCategory === 'Fine Dining' && formData.difficulty === 'Easy') {
      warnings.push('Recipe is too simple for Fine Dining group. Consider setting a higher difficulty level.');
    }

    // Check if recipe is too complex for Quick Meals
    if (groupCategory === 'Quick Meals' && formData.difficulty === 'Hard') {
      warnings.push('Recipe is too complex for Quick Meals group. Consider setting a lower difficulty level.');
    }

    // Check cooking time for Quick Meals
    if (groupCategory === 'Quick Meals') {
      const totalTime = (parseInt(formData.prepTime) || 0) + (parseInt(formData.cookTime) || 0);
      if (totalTime > 30) {
        warnings.push('Cooking time is too long for Quick Meals group. Recommended: up to 30 minutes.');
      }
    }

    // Check if recipe is too complex for Healthy Eating
    if (groupCategory === 'Healthy Eating' && formData.difficulty === 'Hard') {
      warnings.push('Recipe is too complex for Healthy Eating group. Consider setting a lower difficulty level.');
    }

    // Check if recipe is too simple for Fine Dining
    if (groupCategory === 'Fine Dining' && formData.difficulty === 'Easy') {
      warnings.push('Recipe is too simple for Fine Dining group. Consider setting a higher difficulty level.');
    }

    // Check if recipe has too many servings for Quick Meals
    if (groupCategory === 'Quick Meals' && parseInt(formData.servings) > 6) {
      warnings.push('Too many servings for Quick Meals group. Recommended: up to 6 servings.');
    }

    // Check if recipe has too few servings for Fine Dining
    if (groupCategory === 'Fine Dining' && parseInt(formData.servings) < 2) {
      warnings.push('Too few servings for Fine Dining group. Recommended: at least 2 servings.');
    }

    setValidationErrors(errors);
    setWarnings(warnings);
    return errors.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validate in real-time for certain fields
    if (['category', 'cuisine', 'difficulty', 'prepTime', 'cookTime', 'servings'].includes(name)) {
      setTimeout(() => {
        validateRecipe();
      }, 100);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
    
    // Validate ingredients in real-time
    if (field === 'name') {
      setTimeout(() => {
        validateRecipe();
      }, 500);
    }
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate recipe before submission
    if (!validateRecipe()) {
      return; // Don't submit if there are validation errors
    }
    
    // Filter out empty ingredients, instructions, and tags
    const filteredIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() !== '' && ing.amount.trim() !== ''
    );
    
    const filteredInstructions = formData.instructions.filter(inst => 
      inst.trim() !== ''
    );
    
    const filteredTags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    onSubmit({
      ...formData,
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 1,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      tags: filteredTags
    });
  };

  return (
    <div className="create-recipe-container">
      <div className="create-recipe-header">
        <h1>Create New Recipe for {groupCategory} Group</h1>
        <p>Share your culinary masterpiece with the {groupCategory} community!</p>
        {groupCategory && (
          <div className="group-restrictions">
            <p><strong>⚠️ {groupCategory} Group Rules:</strong></p>
            <p>Only recipes that match the {groupCategory} theme are allowed.</p>
            {getForbiddenIngredients(groupCategory).length > 0 && (
              <p><strong>❌ Forbidden:</strong> {getForbiddenIngredients(groupCategory).slice(0, 5).join(', ')}{getForbiddenIngredients(groupCategory).length > 5 ? '...' : ''}</p>
            )}
          </div>
        )}
      </div>

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
                {groupCategory ? getCategoriesForGroup(groupCategory).map(category => (
                  <option key={category} value={category}>{category}</option>
                )) : (
                  <>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Dish">Main Dish</option>
                    <option value="Side Dish">Side Dish</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Snack">Snack</option>
                    <option value="Beverage">Beverage</option>
                  </>
                )}
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
                {groupCategory ? getCuisinesForGroup(groupCategory).map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                )) : (
                  <>
                    <option value="Italian">Italian</option>
                    <option value="Asian">Asian</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Mexican">Mexican</option>
                    <option value="American">American</option>
                    <option value="French">French</option>
                    <option value="Indian">Indian</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Other">Other</option>
                  </>
                )}
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
                onChange={handleInputChange}
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
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="e.g., Flour"
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
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
                  onChange={(e) => updateInstruction(index, e.target.value)}
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

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>❌ Errors preventing recipe creation:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="validation-warnings">
            <h4>⚠️ Warnings:</h4>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={validationErrors.length > 0}
          >
            {validationErrors.length > 0 ? 'Fix Errors First' : 'Create Recipe'}
          </button>
        </div>
        
        {validationErrors.length > 0 && (
          <div className="form-help">
            <p><strong>💡 Help:</strong> Fix the errors above to create your recipe. The system ensures all recipes match your group's theme.</p>
          </div>
        )}
        
        {warnings.length > 0 && validationErrors.length === 0 && (
          <div className="form-help">
            <p><strong>💡 Note:</strong> You have warnings above, but you can still create the recipe. Consider addressing them for better group compatibility.</p>
          </div>
        )}
        
        {validationErrors.length === 0 && warnings.length === 0 && formData.title && formData.category && formData.cuisine && (
          <div className="form-help success">
            <p><strong>✅ Great!</strong> Your recipe looks good and matches your group's theme. You can create it now.</p>
          </div>
        )}
        
        {!formData.title && !formData.category && !formData.cuisine && (
          <div className="form-help">
            <p><strong>📝 Start Here:</strong> Fill in the basic information above to begin creating your recipe.</p>
          </div>
        )}
        
        {formData.title && !formData.category && !formData.cuisine && (
          <div className="form-help">
            <p><strong>📝 Next Step:</strong> Choose a category and cuisine that match your group's theme.</p>
          </div>
        )}
        
        {formData.title && formData.category && !formData.cuisine && (
          <div className="form-help">
            <p><strong>📝 Almost There:</strong> Select a cuisine that matches your group's theme.</p>
          </div>
        )}
        
        {formData.title && formData.category && formData.cuisine && validationErrors.length === 0 && warnings.length === 0 && (
          <div className="form-help success">
            <p><strong>✅ Perfect!</strong> Your recipe is ready to be created. All validations passed!</p>
          </div>
        )}
        
        {formData.title && formData.category && formData.cuisine && validationErrors.length === 0 && warnings.length > 0 && (
          <div className="form-help">
            <p><strong>⚠️ Good to Go:</strong> Your recipe can be created, but consider addressing the warnings above for better group compatibility.</p>
          </div>
        )}
        
        {formData.title && formData.category && formData.cuisine && validationErrors.length > 0 && (
          <div className="form-help">
            <p><strong>❌ Fix Required:</strong> Please address the errors above before creating your recipe.</p>
          </div>
        )}
      </form>
    </div>
  );
};

// Recipe Edit Form Component - Similar to create form but with pre-filled data
const RecipeEditForm = ({ recipe, onSubmit, onCancel, groupCategory }) => {
  const [formData, setFormData] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    category: recipe.category || '',
    cuisine: recipe.cuisine || '',
    difficulty: recipe.difficulty || '',
    prepTime: recipe.prepTime || '',
    cookTime: recipe.cookTime || '',
    servings: recipe.servings || '',
    isPrivate: recipe.isPrivate || false,
    ingredients: recipe.ingredients || [{ name: '', amount: '', unit: '' }],
    instructions: recipe.instructions || [''],
    tags: recipe.tags ? recipe.tags.join(', ') : ''
  });

  // Same form logic as create form...
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const filteredIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() !== '' && ing.amount.trim() !== ''
    );
    
    const filteredInstructions = formData.instructions.filter(inst => 
      inst.trim() !== ''
    );
    
    const filteredTags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    onSubmit({
      ...formData,
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 1,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      tags: filteredTags
    });
  };

  return (
    <div className="recipe-form-modal">
      <div className="recipe-form">
        <h2>Edit Recipe</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Same form fields as create form */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Update Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupRecipeManager;