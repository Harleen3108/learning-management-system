const express = require('express');
const { getInstructorAnalytics, getEnrolledStudents, getCourseAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('instructor', 'admin', 'super-admin'));

router.get('/instructor', getInstructorAnalytics);
router.get('/students', getEnrolledStudents);
router.get('/course/:id', getCourseAnalytics);

module.exports = router;
