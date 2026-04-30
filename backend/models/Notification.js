const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Who receives this notification
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Optional: which role this targets — used by broadcast helpers (e.g. notify all admins).
    // When set with no recipient, treat as broadcast to everyone with that role.
    recipientRole: {
        type: String,
        enum: ['student', 'instructor', 'admin', 'super-admin', 'parent']
    },
    type: {
        type: String,
        required: true,
        enum: [
            'instructor_application_submitted',
            'instructor_application_approved',
            'instructor_application_rejected',
            'course_submitted',
            'course_approved',
            'course_rejected',
            'course_changes_requested',
            'new_enrollment',
            'new_review',
            'new_live_class',
            'new_coupon',
            'course_updated',
            'new_message',
            'system'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    // Where clicking the notification should take the user
    link: {
        type: String,
        default: ''
    },
    // Optional related entity (course, user, etc.) for filtering / drill-through
    entity: {
        type: { type: String },
        id: { type: mongoose.Schema.Types.ObjectId }
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
