const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Group = require('../models/Group');

// Overview counts for cards
const getOverview = async (req, res) => {
  try {
    const [totalUsers, totalRecipes, totalGroups] = await Promise.all([
      User.countDocuments({}),
      Recipe.countDocuments({}),
      Group.countDocuments({})
    ]);
    res.json({ totalUsers, totalRecipes, totalGroups });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Distribution of cuisines (pie)
const getCuisineDistribution = async (req, res) => {
  try {
    const agg = await Recipe.aggregate([
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const total = agg.reduce((s, r) => s + r.count, 0) || 1;
    const data = agg.map(r => ({
      cuisine: r._id || 'Other',
      count: r.count,
      percentage: Math.round((r.count / total) * 100)
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Groups by category (bar)
const getGroupCategories = async (req, res) => {
  try {
    const agg = await Group.aggregate([
      { $group: { _id: '$category', groupCount: { $sum: 1 } } },
      { $sort: { groupCount: -1 } }
    ]);
    const data = agg.map(r => ({ category: r._id || 'Other', groupCount: r.groupCount }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Top liked recipes (bar)
const getPopularRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: { likesCount: -1 } },
      { $limit: 5 }
    ]);
    await Recipe.populate(recipes, { path: 'author', select: 'fullName username' });
    const data = recipes.map(r => ({
      title: r.title,
      likesCount: r.likesCount || 0,
      author: r.author?.fullName || r.author?.username || 'Unknown',
      cuisine: r.cuisine,
      category: r.category,
      difficulty: r.difficulty
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getOverview,
  getCuisineDistribution,
  getGroupCategories,
  getPopularRecipes
};
