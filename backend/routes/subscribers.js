const express = require('express');
const {
    subscribe,
    getByToken,
    updateByToken,
    unsubscribe,
    trackOpen,
    trackClick
} = require('../controllers/subscriberController');

const router = express.Router();

// Public subscribe (no auth required)
router.post('/subscribe', subscribe);

// Token-based preference / unsubscribe management
router.get('/manage/:token', getByToken);
router.put('/manage/:token', updateByToken);
router.post('/manage/:token/unsubscribe', unsubscribe);

// Engagement tracking endpoints (public — tokens in URL)
router.get('/track/open/:campaignId/:subscriberId', trackOpen);
router.get('/track/click/:campaignId/:subscriberId', trackClick);

module.exports = router;
