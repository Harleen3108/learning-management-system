const Subscriber = require('../models/Subscriber');
const { sendMail, buildCampaignHtml } = require('../services/mail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const buildPreferencesUrl = (token) => `${FRONTEND_URL}/subscribe/manage/${token}`;
const buildUnsubscribeUrl = (token) => `${FRONTEND_URL}/subscribe/manage/${token}?action=unsubscribe`;

// @desc    Subscribe (or update prefs for an existing email)
// @route   POST /api/v1/subscribers/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email, name, preferences = [], categoryInterests = [], source = 'website', type } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'A valid email is required' });
        }

        const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });

        if (existing) {
            // Update preferences/interests + reactivate if previously unsubscribed
            existing.name = name?.trim() || existing.name;
            existing.preferences = Array.from(new Set([...(existing.preferences || []), ...preferences]));
            existing.categoryInterests = Array.from(new Set([...(existing.categoryInterests || []), ...categoryInterests]));
            if (existing.status === 'unsubscribed') {
                existing.status = 'active';
                existing.unsubscribedAt = undefined;
            }
            await existing.save();

            return res.status(200).json({
                success: true,
                updated: true,
                message: 'Your subscription preferences have been updated.',
                data: {
                    email: existing.email,
                    preferences: existing.preferences,
                    categoryInterests: existing.categoryInterests,
                    manageUrl: buildPreferencesUrl(existing.unsubscribeToken)
                }
            });
        }

        const sub = await Subscriber.create({
            email: email.toLowerCase().trim(),
            name: name?.trim(),
            preferences,
            categoryInterests,
            source,
            type: type || 'visitor'
        });

        // Welcome email — best effort, don't fail the request if mail bounces
        try {
            const html = buildCampaignHtml({
                subject: 'Welcome to EduFlow updates 🎉',
                body: `<p>Hi ${escape(sub.name || 'there')},</p>
                       <p>Thanks for subscribing to EduFlow! You'll start receiving updates based on your selected interests.</p>
                       <p>You can change what you receive at any time using the link below.</p>`,
                preferencesUrl: buildPreferencesUrl(sub.unsubscribeToken),
                unsubscribeUrl: buildUnsubscribeUrl(sub.unsubscribeToken)
            });
            await sendMail({ to: sub.email, subject: 'Welcome to EduFlow', html });
        } catch (e) { console.error('[subscribe] welcome mail:', e.message); }

        return res.status(201).json({
            success: true,
            updated: false,
            message: 'Subscribed! Welcome to EduFlow updates.',
            data: {
                email: sub.email,
                preferences: sub.preferences,
                categoryInterests: sub.categoryInterests,
                manageUrl: buildPreferencesUrl(sub.unsubscribeToken)
            }
        });
    } catch (err) {
        console.error('subscribe error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'This email is already subscribed.' });
        }
        res.status(500).json({ success: false, message: err.message || 'Subscription failed' });
    }
};

// @desc    Look up a subscriber by their unsubscribe token (manage page)
// @route   GET /api/v1/subscribers/manage/:token
// @access  Public (token is the auth)
exports.getByToken = async (req, res) => {
    try {
        const sub = await Subscriber.findOne({ unsubscribeToken: req.params.token })
            .select('email name preferences categoryInterests status subscribedAt');
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
        res.status(200).json({
            success: true,
            data: {
                email: sub.email,
                name: sub.name,
                preferences: sub.preferences,
                categoryInterests: sub.categoryInterests,
                status: sub.status,
                subscribedAt: sub.subscribedAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not load preferences' });
    }
};

// @desc    Update preferences via token
// @route   PUT /api/v1/subscribers/manage/:token
// @access  Public (token-authenticated)
exports.updateByToken = async (req, res) => {
    try {
        const { preferences, categoryInterests, name } = req.body;
        const sub = await Subscriber.findOne({ unsubscribeToken: req.params.token });
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

        if (Array.isArray(preferences)) sub.preferences = preferences;
        if (Array.isArray(categoryInterests)) sub.categoryInterests = categoryInterests;
        if (typeof name === 'string') sub.name = name.trim();
        // If they had unsubscribed and are updating prefs, reactivate.
        if (sub.status === 'unsubscribed') {
            sub.status = 'active';
            sub.unsubscribedAt = undefined;
        }
        await sub.save();
        res.status(200).json({
            success: true,
            message: 'Preferences updated.',
            data: {
                email: sub.email,
                name: sub.name,
                preferences: sub.preferences,
                categoryInterests: sub.categoryInterests,
                status: sub.status,
                subscribedAt: sub.subscribedAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not update preferences' });
    }
};

// @desc    Unsubscribe via token
// @route   POST /api/v1/subscribers/manage/:token/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
    try {
        const sub = await Subscriber.findOneAndUpdate(
            { unsubscribeToken: req.params.token },
            { status: 'unsubscribed', unsubscribedAt: new Date() },
            { new: true }
        );
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
        res.status(200).json({ success: true, message: 'You have been unsubscribed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not unsubscribe' });
    }
};

// ─────────────────────────────────────────────────────────
// Engagement tracking — open pixel + click redirect
// ─────────────────────────────────────────────────────────

// Transparent 1×1 GIF
const TRACKING_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

// @route   GET /api/v1/track/open/:campaignId/:subscriberId
exports.trackOpen = async (req, res) => {
    try {
        const Campaign = require('../models/Campaign');
        await Promise.all([
            Subscriber.findByIdAndUpdate(req.params.subscriberId, {
                $inc: { 'engagement.opens': 1 },
                $set: { 'engagement.lastOpenedAt': new Date(), 'engagement.lastEngagedAt': new Date() }
            }),
            Campaign.findByIdAndUpdate(req.params.campaignId, { $inc: { 'stats.opens': 1 } })
        ]);
    } catch (err) { /* swallow tracking errors */ }
    res.set({ 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' }).end(TRACKING_PIXEL);
};

// @route   GET /api/v1/track/click/:campaignId/:subscriberId?url=
exports.trackClick = async (req, res) => {
    const target = req.query.url || FRONTEND_URL;
    try {
        const Campaign = require('../models/Campaign');
        await Promise.all([
            Subscriber.findByIdAndUpdate(req.params.subscriberId, {
                $inc: { 'engagement.clicks': 1 },
                $set: { 'engagement.lastClickedAt': new Date(), 'engagement.lastEngagedAt': new Date() }
            }),
            Campaign.findByIdAndUpdate(req.params.campaignId, { $inc: { 'stats.clicks': 1 } })
        ]);
    } catch (err) { /* swallow */ }
    res.redirect(target);
};

function escape(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}
