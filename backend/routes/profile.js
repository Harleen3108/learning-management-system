const express = require('express');
const {
    getMyProfile,
    updateMyProfile,
    getPublicProfile,
    getMyPurchases
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.get('/purchases', protect, getMyPurchases);
router.get('/public/:id', getPublicProfile);

module.exports = router;
