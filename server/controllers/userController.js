const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName, bio, location } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      bio,
      location: location || ''
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        location: user.location,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      location: user.location,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      location: user.location,
      experience: user.experience,
      role: user.role,
      joinedGroups: user.joinedGroups,
      favoriteRecipes: user.favoriteRecipes,
      friends: user.friends,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.bio = req.body.bio || user.bio;
      user.location = req.body.location || user.location;
      user.experience = req.body.experience || user.experience;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        location: updatedUser.location,
        experience: updatedUser.experience,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        joinedGroups: updatedUser.joinedGroups,
        friends: updatedUser.friends,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search, skills, dietaryPreferences, page = 1, limit = 20 } = req.query;
    
    let query = {};

    // Search by username or fullName
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by skills
    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    // Filter by dietary preferences
    if (dietaryPreferences) {
      query.dietaryPreferences = { $in: dietaryPreferences.split(',') };
    }

    // Exclude administrators from user search
    query.role = { $nin: ['group_admin', 'admin'] };

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Advanced search users (ADVANCED SEARCH #2)
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { 
      search,              // Parameter 1: Username or full name
      location,            // Parameter 2: User location
      experience,          // Parameter 3: Experience level
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    let andConditions = [];

    // Filter 1: Search by username, fullName, or bio
    if (search) {
      andConditions.push({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Filter 2: Location (search in bio or location field)
    if (location) {
      andConditions.push({
        $or: [
          { bio: { $regex: location, $options: 'i' } },
          { location: { $regex: location, $options: 'i' } }
        ]
      });
    }

    // Filter 3: Experience Level
    if (experience) {
      andConditions.push({ experience: experience });
    }

    // Combine all AND conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Exclude administrators from user search
    query.role = { $nin: ['group_admin', 'admin'] };

    const users = await User.find(query)
      .select('-password')
      .populate('joinedGroups', 'name category')
      // .populate('recipes') // removed: users schema has no 'recipes' path
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      filters: { search, location, experience }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('joinedGroups', 'name category coverImage')
      .populate('favoriteRecipes', 'title images cuisine');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (own account) or Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is deleting own account or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add recipe to favorites
// @route   POST /api/users/favorites/:recipeId
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.recipeId;

    if (!user.favoriteRecipes.includes(recipeId)) {
      user.favoriteRecipes.push(recipeId);
      await user.save();
      res.json({ message: 'Recipe added to favorites', favoriteRecipes: user.favoriteRecipes });
    } else {
      res.status(400).json({ message: 'Recipe already in favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/users/favorites/:recipeId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favoriteRecipes = user.favoriteRecipes.filter(
      id => id.toString() !== req.params.recipeId
    );
    await user.save();
    res.json({ message: 'Recipe removed from favorites', favoriteRecipes: user.favoriteRecipes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add friend
// @route   POST /api/users/friends/:userId
// @access  Private
const addFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only regular users can send friend requests
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Only regular users can send friend requests' });
    }

    // Check if already friends or request exists
    const existingFriend = user.friends.find(f => f.user.toString() === userId);
    if (existingFriend) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Check if target user already has a request from current user
    const existingRequest = targetUser.friends.find(f => f.user.toString() === currentUserId.toString());
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Add friend request to target user (the one who will receive the request)
    targetUser.friends.push({ user: currentUserId, status: 'pending' });
    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/users/friends/:userId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    user.friends = user.friends.filter(f => f.user.toString() !== userId);
    await user.save();

    // Remove from target user's friends list too
    const targetUser = await User.findById(userId);
    if (targetUser) {
      targetUser.friends = targetUser.friends.filter(f => f.user.toString() !== currentUserId.toString());
      await targetUser.save();
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get friends
// @route   GET /api/users/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends.user', 'username fullName bio location experience');

    const friends = user.friends.filter(f => f.status === 'accepted');
    res.json({ friends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/users/friends/pending
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends.user', 'username fullName bio location experience');

    const pendingRequests = user.friends.filter(f => f.status === 'pending');
    res.json({ requests: pendingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/users/friends/accept/:requestId
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    const friendRequest = user.friends.id(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = 'accepted';
    await user.save();

    // Add to target user's friends list
    const targetUser = await User.findById(friendRequest.user);
    if (targetUser) {
      targetUser.friends.push({ user: currentUserId, status: 'accepted' });
      await targetUser.save();
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject friend request
// @route   POST /api/users/friends/reject/:requestId
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    user.friends = user.friends.filter(f => f._id.toString() !== requestId);
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  searchUsers,
  getUserById,
  deleteUser,
  addToFavorites,
  removeFromFavorites,
  addFriend,
  removeFriend,
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest
};
