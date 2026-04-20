const express = require('express');
const {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    getMyResults,
    getInstructorResults
} = require('../controllers/quizController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('instructor', 'super-admin'), createQuiz);
router.put('/:id', authorize('instructor', 'super-admin'), updateQuiz);
router.delete('/:id', authorize('instructor', 'super-admin'), deleteQuiz);
router.post('/:id/submit', authorize('student'), submitQuiz);
router.get('/results/me', authorize('student'), getMyResults);
router.get('/results/instructor', authorize('instructor', 'admin', 'super-admin'), getInstructorResults);

module.exports = router;
