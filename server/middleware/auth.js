const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware removed (no system admin role)
const admin = (req, res, next) => {
  return res.status(403).json({ message: 'Access denied.' });
};

// Group admin middleware
const groupAdmin = async (req, res, next) => {
  try {
    const Group = require('../models/Group');
    const group = await Group.findById(req.params.groupId || req.body.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is group admin
    if (group.admin.toString() === req.user._id.toString()) {
      req.group = group;
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Group admin only.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { protect, groupAdmin };
