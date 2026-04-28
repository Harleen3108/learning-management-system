const Notification = require('../models/Notification');

// @desc    List notifications for the current user
// @route   GET /api/v1/notifications?unread=true&limit=20
// @access  Private
exports.listNotifications = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const onlyUnread = req.query.unread === 'true';

        const query = { recipient: req.user.id };
        if (onlyUnread) query.isRead = false;

        const [notifications, unreadCount] = await Promise.all([
            Notification.find(query).sort('-createdAt').limit(limit),
            Notification.countDocuments({ recipient: req.user.id, isRead: false })
        ]);

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (err) {
        console.error('listNotifications error:', err);
        res.status(500).json({ success: false, message: 'Failed to load notifications' });
    }
};

// @desc    Quick unread count (used by the bell badge)
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });
        res.status(200).json({ success: true, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to load count' });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.status(200).json({ success: true, data: notif });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};

// @desc    Mark every notification for this user as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete' });
    }
};
