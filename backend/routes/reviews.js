const express = require('express');
const {
    getReviews,
    getCourseReviews,
    addReview,
    deleteReview,
    moderateReview,
    getInstructorReviews
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', getCourseReviews);

router.get('/instructor/me', protect, authorize('instructor', 'admin'), getInstructorReviews);

router
    .route('/')
    .get(getReviews)
    .post(protect, authorize('student'), addReview);

router
    .route('/:id')
    .delete(protect, authorize('student', 'admin'), deleteReview);

router.put('/:id/moderate', protect, authorize('admin'), moderateReview);

module.exports = router;
