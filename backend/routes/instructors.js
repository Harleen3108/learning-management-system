const express = require('express');
const {
    getInstructorProfile,
    updateProfile
} = require('../controllers/instructorController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/:id/profile', getInstructorProfile);

// Protected routes
router.use(protect);
router.use(authorize('instructor', 'admin'));
router.put('/profile', updateProfile);

module.exports = router;
