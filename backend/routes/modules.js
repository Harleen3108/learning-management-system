const express = require('express');
const {
    getModules,
    addModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const lessonRouter = require('./lessons');

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:moduleId/lessons', lessonRouter);

router.route('/')
    .get(getModules)
    .post(protect, authorize('instructor', 'super-admin'), addModule);

router.route('/:id')
    .put(protect, authorize('instructor', 'super-admin'), updateModule)
    .delete(protect, authorize('instructor', 'super-admin'), deleteModule);

module.exports = router;
