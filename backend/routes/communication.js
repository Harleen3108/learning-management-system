const express = require('express');
const {
    getInstructorCourses,
    getInstructorQnA,
    replyToQuestion,
    getCourseStudents,
    getMessages,
    sendMessage,
    listThreads,
    markThreadRead,
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    gradeSubmission,
    createAnnouncement,
    getAnnouncements
} = require('../controllers/communicationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('instructor', 'admin', 'super-admin'));

router.get('/courses', getInstructorCourses);
router.get('/students', getCourseStudents);

router.route('/qna')
    .get(getInstructorQnA);

router.post('/qna/:id/reply', replyToQuestion);

router.route('/messages')
    .get(getMessages)
    .post(sendMessage);

router.get('/threads', listThreads);
router.post('/threads/:conversationId/read', markThreadRead);

router.route('/assignments')
    .get(getAssignments)
    .post(createAssignment);

router.route('/assignments/:id')
    .put(updateAssignment)
    .delete(deleteAssignment);

router.get('/assignments/:id/submissions', getSubmissions);
router.put('/submissions/:id/grade', gradeSubmission);

router.route('/announcements')
    .get(getAnnouncements)
    .post(createAnnouncement);

module.exports = router;
