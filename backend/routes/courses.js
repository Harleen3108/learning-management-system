const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    updateCourseStatus,
    bulkSyncCourse,
    getInstructorCourses,
    deleteCourse,
    getInstructorStudents,
    getLessonVideoUrl,
    updateLessonFeedback,
    getCourseAuditHistory,
    getUploadSignature,
    getTrendingCourses
} = require('../controllers/courseController');

// Include other resource routers
const moduleRouter = require('./modules');

const { protect, authorize } = require('../middleware/auth');
const { checkEnrollment } = require('../middleware/enrollmentMiddleware');

const router = express.Router();

router.get('/trending', getTrendingCourses);

router.post('/upload-signature', protect, authorize('instructor', 'admin'), getUploadSignature);

// Re-route into other resource routers
router.use('/:courseId/modules', moduleRouter);

router.route('/')
    .get(getCourses)
    .post(protect, authorize('instructor', 'admin'), createCourse);

router.get('/instructor/me', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/instructor-students', protect, authorize('instructor', 'admin'), getInstructorStudents);

router.get('/:courseId/lessons/:lessonId/video', protect, checkEnrollment, getLessonVideoUrl);
router.patch('/:courseId/lessons/:lessonId/feedback', protect, authorize('admin'), updateLessonFeedback);

router.route('/:id')
    .get(protect, getCourse)
    .put(protect, authorize('instructor', 'admin'), updateCourse)
    .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.put('/:id/bulk-sync', protect, authorize('instructor', 'admin'), bulkSyncCourse);

router.route('/:id/status')
    .patch(protect, authorize('admin'), updateCourseStatus);

router.get('/:id/audit-history', protect, getCourseAuditHistory);

module.exports = router;
