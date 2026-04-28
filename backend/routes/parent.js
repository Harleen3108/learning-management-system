const express = require('express');
const { 
    getLinkedStudents, 
    getStudentProgress, 
    linkStudentByCode 
} = require('../controllers/parentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and restricted to parents
router.use(protect);
router.use(authorize('parent'));

router.get('/students', getLinkedStudents);
router.get('/students/:studentId/progress', getStudentProgress);
router.post('/link', linkStudentByCode);

module.exports = router;
