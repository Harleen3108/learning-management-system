const express = require('express');
const {
    getStudentDashboard,
    updateProgress,
    getCourseProgress,
    addNote,
    getNotes,
    getLeaderboard,
    getMyCourses,
    toggleBookmark,
    getBookmarks,
    markAsRead,
    submitAssignment,
    getLessonProgress,
    sendDirectMessage,
    listMyThreads,
    getThreadMessages
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('student', 'instructor', 'admin'), getStudentDashboard);
router.get('/my-courses', authorize('student', 'instructor', 'admin'), getMyCourses);
router.post('/progress', authorize('student', 'instructor', 'admin'), updateProgress);
router.get('/progress/:courseId', authorize('student', 'instructor', 'admin'), getCourseProgress);
router.get('/progress/lesson/:lessonId', authorize('student', 'instructor', 'admin'), getLessonProgress);
router.post('/progress/:lessonId/mark-read', authorize('student', 'instructor', 'admin'), markAsRead);
router.post('/progress/:lessonId/submit-assignment', authorize('student', 'instructor', 'admin'), submitAssignment);
router.post('/notes', authorize('student', 'instructor', 'admin'), addNote);
router.get('/notes/:courseId', authorize('student', 'instructor', 'admin'), getNotes);
router.post('/bookmarks', authorize('student', 'instructor', 'admin'), toggleBookmark);
router.get('/bookmarks', authorize('student', 'instructor', 'admin'), getBookmarks);
router.get('/leaderboard', getLeaderboard);

// Direct messaging — student → instructor
router.post('/messages', authorize('student', 'instructor', 'admin'), sendDirectMessage);
router.get('/messages/threads', authorize('student', 'instructor', 'admin'), listMyThreads);
router.get('/messages/:conversationId', authorize('student', 'instructor', 'admin'), getThreadMessages);

module.exports = router;
