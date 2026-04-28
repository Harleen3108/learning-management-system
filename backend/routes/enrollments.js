const express = require('express');
const {
    enrollCourse,
    verifyPayment,
    createCartOrder,
    verifyCartPayment
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Cart checkout — must be defined BEFORE the dynamic /:courseId route
router.post('/cart/order', authorize('student', 'admin'), createCartOrder);
router.post('/cart/verify', authorize('student', 'admin'), verifyCartPayment);

router.post('/:courseId', authorize('student', 'admin'), enrollCourse);
router.post('/verify', authorize('student', 'admin'), verifyPayment);

module.exports = router;
