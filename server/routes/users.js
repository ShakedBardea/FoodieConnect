const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  searchUsers,
  getUserById,
  deleteUser,
  addFriend,
  removeFriend,
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation rules
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Private routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/search', protect, searchUsers); // Advanced search

// Friends routes (must come before /:id routes)
router.post('/friends/:userId', protect, addFriend);
router.delete('/friends/:userId', protect, removeFriend);
router.get('/friends', protect, getFriends);
router.get('/friends/pending', protect, getPendingRequests);
router.post('/friends/accept/:requestId', protect, acceptFriendRequest);
router.post('/friends/reject/:requestId', protect, rejectFriendRequest);

// User routes
router.get('/', getUsers);
router.get('/:id', getUserById);
router.delete('/:id', protect, deleteUser);

module.exports = router;