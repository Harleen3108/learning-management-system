const express = require('express');
const {
    getLessons,
    addLesson,
    updateLesson,
    deleteLesson
} = require('../controllers/lessonController');

const { protect, authorize } = require('../middleware/auth');
const { checkEnrollment } = require('../middleware/enrollmentMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(protect, checkEnrollment, getLessons)
    .post(protect, authorize('instructor', 'super-admin'), addLesson);

router.route('/:id')
    .put(protect, authorize('instructor', 'super-admin'), updateLesson)
    .delete(protect, authorize('instructor', 'super-admin'), deleteLesson);

module.exports = router;
