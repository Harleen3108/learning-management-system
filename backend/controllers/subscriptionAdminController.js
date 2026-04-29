const Subscriber = require('../models/Subscriber');
const Campaign = require('../models/Campaign');
const { sendMail, buildCampaignHtml } = require('../services/mail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// ─────────────────────────────────────────────────────────
// Subscribers
// ─────────────────────────────────────────────────────────

// @desc    List subscribers with optional filters
// @route   GET /api/v1/admin/subscribers
exports.listSubscribers = async (req, res) => {
    try {
        const { status, type, preference, interest, search, limit = 100 } = req.query;
        const q = {};
        if (status) q.status = status;
        if (type) q.type = type;
        if (preference) q.preferences = preference;
        if (interest) q.categoryInterests = interest;
        if (search) {
            q.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name:  { $regex: search, $options: 'i' } }
            ];
        }
        const subs = await Subscriber.find(q).sort('-createdAt').limit(Number(limit) || 100).lean();
        res.status(200).json({ success: true, count: subs.length, data: subs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Subscriber stats (audience size, engagement)
// @route   GET /api/v1/admin/subscribers/stats
exports.subscriberStats = async (req, res) => {
    try {
        const [total, active, unsubscribed, byPref, byInterest, engagementAgg] = await Promise.all([
            Subscriber.countDocuments(),
            Subscriber.countDocuments({ status: 'active' }),
            Subscriber.countDocuments({ status: 'unsubscribed' }),
            Subscriber.aggregate([
                { $match: { status: 'active' } },
                { $unwind: '$preferences' },
                { $group: { _id: '$preferences', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Subscriber.aggregate([
                { $match: { status: 'active' } },
                { $unwind: '$categoryInterests' },
                { $group: { _id: '$categoryInterests', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Subscriber.aggregate([
                { $group: {
                    _id: null,
                    totalOpens: { $sum: '$engagement.opens' },
                    totalClicks: { $sum: '$engagement.clicks' }
                } }
            ])
        ]);

        const engagement = engagementAgg[0] || { totalOpens: 0, totalClicks: 0 };

        res.status(200).json({
            success: true,
            data: {
                total, active, unsubscribed,
                byPreference: byPref.map(p => ({ key: p._id, count: p.count })),
                byInterest: byInterest.map(i => ({ key: i._id, count: i.count })),
                totalOpens: engagement.totalOpens,
                totalClicks: engagement.totalClicks
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a subscriber
// @route   DELETE /api/v1/admin/subscribers/:id
exports.deleteSubscriber = async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────
// Campaigns
// ─────────────────────────────────────────────────────────

// @desc    List campaigns
// @route   GET /api/v1/admin/campaigns
exports.listCampaigns = async (req, res) => {
    try {
        const items = await Campaign.find().sort('-createdAt').lean();
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create a campaign (draft)
// @route   POST /api/v1/admin/campaigns
exports.createCampaign = async (req, res) => {
    try {
        const { title, subject, body, type, audience } = req.body;
        if (!title || !subject || !body) {
            return res.status(400).json({ success: false, message: 'title, subject and body are required' });
        }
        const campaign = await Campaign.create({
            title, subject, body, type,
            audience: {
                allActive: !!audience?.allActive,
                preferences: audience?.preferences || [],
                categoryInterests: audience?.categoryInterests || []
            },
            createdBy: req.user.id
        });
        res.status(201).json({ success: true, data: campaign });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Preview the audience size for a campaign (or audience definition)
// @route   POST /api/v1/admin/campaigns/preview-audience
exports.previewAudience = async (req, res) => {
    try {
        const audience = req.body.audience || {};
        const query = buildAudienceQuery(audience);
        const count = await Subscriber.countDocuments(query);
        res.status(200).json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send a campaign to its target audience
// @route   POST /api/v1/admin/campaigns/:id/send
exports.sendCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
        if (campaign.status === 'sent' || campaign.status === 'sending') {
            return res.status(400).json({ success: false, message: `Campaign is already ${campaign.status}` });
        }

        const audienceQuery = buildAudienceQuery(campaign.audience);
        const recipients = await Subscriber.find(audienceQuery).select('email name unsubscribeToken _id').lean();

        if (recipients.length === 0) {
            campaign.status = 'failed';
            await campaign.save();
            return res.status(400).json({ success: false, message: 'No subscribers match this audience.' });
        }

        campaign.status = 'sending';
        campaign.stats.recipients = recipients.length;
        await campaign.save();

        // Fan-out send. Done sequentially to keep it simple; for big lists,
        // throttle / queue. Failures are counted but don't abort the whole send.
        let sent = 0, failed = 0;
        for (const sub of recipients) {
            try {
                const html = buildCampaignHtml({
                    subject: campaign.subject,
                    body: campaign.body,
                    trackingPixelUrl: `${API_URL}/subscribers/track/open/${campaign._id}/${sub._id}`,
                    unsubscribeUrl: `${FRONTEND_URL}/subscribe/manage/${sub.unsubscribeToken}?action=unsubscribe`,
                    preferencesUrl: `${FRONTEND_URL}/subscribe/manage/${sub.unsubscribeToken}`
                });
                const result = await sendMail({ to: sub.email, subject: campaign.subject, html });
                if (result.ok) sent++; else failed++;
            } catch (e) {
                failed++;
            }
        }

        campaign.status = 'sent';
        campaign.sentAt = new Date();
        campaign.stats.sent = sent;
        campaign.stats.failed = failed;
        await campaign.save();

        res.status(200).json({
            success: true,
            data: { sent, failed, recipients: recipients.length },
            campaign
        });
    } catch (err) {
        console.error('sendCampaign error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a campaign (only drafts/failed)
// @route   DELETE /api/v1/admin/campaigns/:id
exports.deleteCampaign = async (req, res) => {
    try {
        await Campaign.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function buildAudienceQuery(audience = {}) {
    const q = { status: 'active' };
    if (audience.allActive) return q;

    const ors = [];
    if (audience.preferences?.length) ors.push({ preferences: { $in: audience.preferences } });
    if (audience.categoryInterests?.length) ors.push({ categoryInterests: { $in: audience.categoryInterests } });
    if (ors.length === 1) Object.assign(q, ors[0]);
    else if (ors.length > 1) q.$or = ors;
    return q;
}
