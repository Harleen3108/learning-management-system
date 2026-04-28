const express = require('express');
const { 
    getInstructorAnalytics, 
    getEnrolledStudents, 
    getCourseAnalytics,
    getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin', 'super-admin'), getAdminAnalytics);
router.get('/instructor', authorize('instructor', 'admin', 'super-admin'), getInstructorAnalytics);
router.get('/students', authorize('instructor', 'admin', 'super-admin'), getEnrolledStudents);
router.get('/course/:id', authorize('instructor', 'admin', 'super-admin'), getCourseAnalytics);

module.exports = router;
