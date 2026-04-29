const SiteAnnouncement = require('../models/SiteAnnouncement');

// Public: returns the single best announcement to display, or null.
// "best" = isActive && (no expiry OR expiry in future), ordered by priority desc, recency desc.
exports.getActive = async (req, res) => {
    try {
        const now = new Date();
        const ann = await SiteAnnouncement.findOne({
            isActive: true,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }]
        }).sort({ priority: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: ann });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: list all announcements (active + inactive + expired)
exports.list = async (req, res) => {
    try {
        const announcements = await SiteAnnouncement.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: create
exports.create = async (req, res) => {
    try {
        const { message, theme, ctaText, ctaHref, countdownTo, expiresAt, isActive, priority } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        const ann = await SiteAnnouncement.create({
            message: message.trim(),
            theme: theme || 'flash',
            ctaText: ctaText?.trim() || undefined,
            ctaHref: ctaHref?.trim() || undefined,
            countdownTo: countdownTo || undefined,
            expiresAt: expiresAt || undefined,
            isActive: isActive !== undefined ? isActive : true,
            priority: typeof priority === 'number' ? priority : 0,
            createdBy: req.user?._id
        });
        res.status(201).json({ success: true, data: ann });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: update
exports.update = async (req, res) => {
    try {
        const allowed = ['message', 'theme', 'ctaText', 'ctaHref', 'countdownTo', 'expiresAt', 'isActive', 'priority'];
        const updates = {};
        for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

        const ann = await SiteAnnouncement.findByIdAndUpdate(req.params.id, updates, {
            new: true, runValidators: true
        });
        if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.status(200).json({ success: true, data: ann });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: toggle active
exports.toggleActive = async (req, res) => {
    try {
        const ann = await SiteAnnouncement.findById(req.params.id);
        if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
        ann.isActive = !ann.isActive;
        await ann.save();
        res.status(200).json({ success: true, data: ann });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: delete
exports.remove = async (req, res) => {
    try {
        const ann = await SiteAnnouncement.findByIdAndDelete(req.params.id);
        if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
