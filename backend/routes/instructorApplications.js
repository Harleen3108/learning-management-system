const express = require('express');
const {
    submitApplication,
    getMyStatus,
    getApplications,
    updateApplicationStatus
} = require('../controllers/instructorApplications');

const InstructorApplication = require('../models/InstructorApplication');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Public submission – guests can apply; we'll auto-provision a user account.
router.post('/', submitApplication);

// Authenticated routes
router.get('/my-status', protect, getMyStatus);

// Admin-only
router.get('/', protect, authorize('admin'), advancedResults(InstructorApplication, 'user'), getApplications);
router.put('/:id', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
