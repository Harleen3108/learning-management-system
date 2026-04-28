const express = require('express');
const {
    getOverview,
    getRevenueAnalytics,
    getStudentsAnalytics,
    getReviewsAnalytics,
    getEngagementAnalytics
} = require('../controllers/performanceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('instructor', 'admin', 'super-admin'));

router.get('/overview', getOverview);
router.get('/revenue', getRevenueAnalytics);
router.get('/students', getStudentsAnalytics);
router.get('/reviews', getReviewsAnalytics);
router.get('/engagement', getEngagementAnalytics);

module.exports = router;
