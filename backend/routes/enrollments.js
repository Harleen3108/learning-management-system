const express = require('express');
const { enrollCourse, verifyPayment } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/:courseId', authorize('student', 'admin'), enrollCourse);
router.post('/verify', authorize('student', 'admin'), verifyPayment);

module.exports = router;
