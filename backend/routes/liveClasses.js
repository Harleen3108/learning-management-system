const express = require('express');
const { scheduleLiveClass, getLiveClasses, getMyLiveClasses, updateLiveClass, deleteLiveClass } = require('../controllers/liveClassController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, authorize('instructor', 'admin', 'super-admin'), scheduleLiveClass);

router.get('/me', protect, authorize('instructor', 'admin'), getMyLiveClasses);

router.route('/:id')
    .put(protect, authorize('instructor', 'admin'), updateLiveClass)
    .delete(protect, authorize('instructor', 'admin'), deleteLiveClass);

router.route('/course/:courseId')
    .get(getLiveClasses);

module.exports = router;
