const Recipe = require('../models/Recipe');

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
  try {
    // For group admins, automatically set the group ID
    let recipeData = {
      ...req.body,
      author: req.user._id
    };

    // If user is a group admin, find their group and set it
    if (req.user.role === 'group_admin') {
      const Group = require('../models/Group');
      const group = await Group.findOne({ admin: req.user._id });
      if (group) {
        recipeData.group = group._id;
      }
    }

    const recipe = await Recipe.create(recipeData);

    await recipe.populate('author', 'username fullName profilePicture');
    if (recipe.group) {
      await recipe.populate('group', 'name');
    }
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Recipe creation error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all recipes with filters (ADVANCED SEARCH #1)
// @route   GET /api/recipes/search
// @access  Public
const searchRecipes = async (req, res) => {
  try {
    const { 
      cuisine,           // Parameter 1
      difficulty,        // Parameter 2
      maxPrepTime,       // Parameter 3
      dietaryPreferences,// Parameter 4 (search in tags)
      ingredients,       // Parameter 5 (free text)
      isPrivate,         // Parameter 6 (privacy filter)
      category,
      page = 1, 
      limit = 12 
    } = req.query;
    
    let query = {};

    // Filter 1: Cuisine
    if (cuisine && cuisine !== 'All') {
      query.cuisine = cuisine;
    }

    // Filter 2: Difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Filter 3: Max Prep Time
    if (maxPrepTime) {
      query.prepTime = { $lte: parseInt(maxPrepTime) };
    }

    // Filter 4: Dietary Preferences (search in tags)
    if (dietaryPreferences) {
      query.tags = { $in: dietaryPreferences.split(',') };
    }

    // Filter 5: Ingredients (free text search)
    if (ingredients) {
      query['ingredients.name'] = { $regex: ingredients, $options: 'i' };
    }

    // Additional filter: Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter 6: Privacy
    if (isPrivate !== undefined && isPrivate !== '') {
      query.isPrivate = isPrivate === 'true';
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username fullName profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Recipe.countDocuments(query);

    res.json({
      recipes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      filters: { cuisine, difficulty, maxPrepTime, dietaryPreferences, ingredients, isPrivate }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all recipes (simple list)
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const recipes = await Recipe.find()
      .populate('author', 'username fullName profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Recipe.countDocuments();

    res.json({
      recipes,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username fullName profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('likes', 'username profilePicture');

    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private (author only)
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is author or admin
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username fullName profilePicture');

    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (author only)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is author or admin
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike recipe
// @route   POST /api/recipes/:id/like
// @access  Private
const toggleLikeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const likeIndex = recipe.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      recipe.likes.splice(likeIndex, 1);
      await recipe.save();
      res.json({ message: 'Recipe unliked', likes: recipe.likes.length });
    } else {
      // Like
      recipe.likes.push(req.user._id);
      await recipe.save();
      res.json({ message: 'Recipe liked', likes: recipe.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add comment to recipe
// @route   POST /api/recipes/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    recipe.comments.push(comment);
    await recipe.save();

    await recipe.populate('comments.user', 'username profilePicture');
    res.status(201).json(recipe.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/recipes/:id/comments/:commentId
// @access  Private (comment author only)
const deleteComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = recipe.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await recipe.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's recipes
// @route   GET /api/recipes/user/:userId
// @access  Public
const getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get popular recipes (most liked)
// @route   GET /api/recipes/popular
// @access  Public
const getPopularRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([
      {
        $addFields: {
          likesCount: { $size: '$likes' }
        }
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate author
    await Recipe.populate(recipes, { 
      path: 'author', 
      select: 'username fullName profilePicture' 
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get recipes for a specific group
// @route   GET /api/recipes/group/:groupId
// @access  Public
const getGroupRecipes = async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log('Getting recipes for group:', groupId);
    
    const recipes = await Recipe.find({ group: groupId })
      .populate('author', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    console.log('Found recipes:', recipes.length);
    res.json(recipes);
  } catch (error) {
    console.error('Error in getGroupRecipes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRecipe,
  searchRecipes,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  addComment,
  deleteComment,
  getUserRecipes,
  getGroupRecipes,
  getPopularRecipes
};
