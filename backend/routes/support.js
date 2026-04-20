const express = require('express');
const {
    getTickets,
    getTicket,
    updateTicket,
    addReply,
    getSupportStats
} = require('../controllers/supportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all support routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSupportStats);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.put('/tickets/:id', updateTicket);
router.post('/tickets/:id/replies', addReply);

module.exports = router;
