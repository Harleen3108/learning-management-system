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

router.get('/dashboard', authorize('student', 'admin'), getStudentDashboard);
router.get('/my-courses', authorize('student', 'admin'), getMyCourses);
router.post('/progress', authorize('student', 'admin'), updateProgress);
router.get('/progress/:courseId', authorize('student', 'admin'), getCourseProgress);
router.post('/notes', authorize('student', 'admin'), addNote);
router.get('/notes/:courseId', authorize('student', 'admin'), getNotes);
router.post('/bookmarks', authorize('student', 'admin'), toggleBookmark);
router.get('/bookmarks', authorize('student', 'admin'), getBookmarks);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
