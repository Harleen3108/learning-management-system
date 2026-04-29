const express = require('express');
const {
    getDashboardStats,
    getUsers,
    updateUser,
    getTransactions,
    processRefund,
    getCoursesAdmin,
    getAuditLogs,
    createUser,
    deleteUser,
    getCoupons,
    createCoupon,
    deleteCoupon,
    getPaymentLogs,
    getInstructors,
    getInstructorProfile,
    updateInstructorStatus,
    getCertificates,
    revokeCertificate,
    getSettings,
    updateSettings,
    getContentMonitoring,
    getReviewStats,
    getUserAnalytics
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/transactions', getTransactions);
router.post('/transactions/:id/refund', processRefund);
router.get('/courses', getCoursesAdmin);
router.get('/logs', getAuditLogs);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/payments/logs', getPaymentLogs);
router.get('/instructors', getInstructors);
router.get('/instructors/:id', getInstructorProfile);
router.put('/instructors/:id/status', updateInstructorStatus);
router.get('/certificates', getCertificates);
router.put('/certificates/:id/revoke', revokeCertificate);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/content/monitoring', getContentMonitoring);
router.get('/reviews/stats', getReviewStats);
router.get('/users/:id/analytics', getUserAnalytics);

// Subscription module — subscribers + campaigns
const subAdmin = require('../controllers/subscriptionAdminController');
router.get('/subscribers', subAdmin.listSubscribers);
router.get('/subscribers/stats', subAdmin.subscriberStats);
router.delete('/subscribers/:id', subAdmin.deleteSubscriber);

router.get('/campaigns', subAdmin.listCampaigns);
router.post('/campaigns', subAdmin.createCampaign);
router.post('/campaigns/preview-audience', subAdmin.previewAudience);
router.post('/campaigns/:id/send', subAdmin.sendCampaign);
router.delete('/campaigns/:id', subAdmin.deleteCampaign);

module.exports = router;
