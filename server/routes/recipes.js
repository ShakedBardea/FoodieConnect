const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
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
} = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const recipeValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required')
];

// Public routes
router.get('/search', searchRecipes); // Advanced search
router.get('/popular', getPopularRecipes);
router.get('/', getRecipes);
router.get('/user/:userId', getUserRecipes);
router.get('/group/:groupId', getGroupRecipes);
router.get('/:id', getRecipeById);

// Private routes
router.post('/', protect, recipeValidation, validate, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/like', protect, toggleLikeRecipe);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
