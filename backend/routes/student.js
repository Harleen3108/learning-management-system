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
    getBookmarks
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('student', 'instructor', 'admin'), getStudentDashboard);
router.get('/my-courses', authorize('student', 'instructor', 'admin'), getMyCourses);
router.post('/progress', authorize('student', 'instructor', 'admin'), updateProgress);
router.get('/progress/:courseId', authorize('student', 'instructor', 'admin'), getCourseProgress);
router.post('/notes', authorize('student', 'instructor', 'admin'), addNote);
router.get('/notes/:courseId', authorize('student', 'instructor', 'admin'), getNotes);
router.post('/bookmarks', authorize('student', 'instructor', 'admin'), toggleBookmark);
router.get('/bookmarks', authorize('student', 'instructor', 'admin'), getBookmarks);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
