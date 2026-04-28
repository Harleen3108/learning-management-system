const express = require('express');
const { getSettings, updateSettings } = require('../controllers/instructorSettingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('instructor', 'admin', 'super-admin'));

router.route('/')
    .get(getSettings)
    .put(updateSettings);

module.exports = router;
