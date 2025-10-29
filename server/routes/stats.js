const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPopularRecipes,
  getCuisineDistribution,
  getOverview,
  getGroupCategories
} = require('../controllers/statsController');

// All stats routes are protected
router.get('/popular-recipes', protect, getPopularRecipes);
router.get('/cuisine-distribution', protect, getCuisineDistribution);
router.get('/overview', protect, getOverview);
router.get('/group-categories', protect, getGroupCategories);

// Backward compatibility: map activity-timeline -> cuisine-distribution
router.get('/activity-timeline', protect, getCuisineDistribution);

module.exports = router;
