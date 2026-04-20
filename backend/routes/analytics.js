const express = require('express');
const { getInstructorAnalytics, getEnrolledStudents } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('instructor', 'admin', 'super-admin'));

router.get('/instructor', getInstructorAnalytics);
router.get('/students', getEnrolledStudents);

module.exports = router;
