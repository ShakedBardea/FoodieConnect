const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createGroup,
  getGroups,
  searchGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getPendingRequests,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
  createGroupPost,
  deleteGroupPost,
  createGroupRecipe,
  getUserFeed,
  togglePostLike,
  addPostComment,
  deletePostComment,
  getUserGroups
} = require('../controllers/groupController');
const { protect, groupAdmin } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const groupValidation = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required')
];

const postValidation = [
  body('content').trim().notEmpty().withMessage('Post content is required')
];

const recipeValidation = [
  body('title').trim().notEmpty().withMessage('Recipe title is required'),
  body('description').trim().notEmpty().withMessage('Recipe description is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('cuisine').notEmpty().withMessage('Cuisine is required'),
  body('difficulty').notEmpty().withMessage('Difficulty is required'),
  body('prepTime').isInt({ min: 0 }).withMessage('Prep time must be a number'),
  body('cookTime').isInt({ min: 0 }).withMessage('Cook time must be a number'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be at least 1')
];

const commentValidation = [
  body('text').trim().notEmpty().withMessage('Comment text is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
];

// Authenticated routes (need user context to include private/member groups)
router.get('/search', protect, searchGroups); // Advanced search, now protected
router.get('/', protect, getGroups); // Now protected

// User feed (must be before /:id route)
router.get('/feed', protect, getUserFeed);

// Private routes
router.post('/', protect, groupValidation, validate, createGroup);
router.get('/user/my-groups', protect, getUserGroups);

// Group-specific routes (must be after specific routes)
router.get('/:id', protect, getGroupById);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);

// Group admin routes
router.get('/:id/pending-requests', protect, getPendingRequests);
router.post('/:id/approve/:userId', protect, approveJoinRequest);
router.post('/:id/reject/:userId', protect, rejectJoinRequest);
router.delete('/:id/members/:userId', protect, removeMember);

// Group posts
router.post('/:id/posts', protect, postValidation, validate, createGroupPost);
router.delete('/:id/posts/:postId', protect, deleteGroupPost);
router.post('/:id/posts/:postId/like', protect, togglePostLike);
router.post('/:id/posts/:postId/comments', protect, commentValidation, validate, addPostComment);
router.delete('/:id/posts/:postId/comments/:commentId', protect, deletePostComment);

// Group recipes
router.post('/:id/recipes', protect, recipeValidation, validate, createGroupRecipe);


module.exports = router;
