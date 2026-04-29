const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    // Plain text or basic HTML body. Tracking pixel + unsubscribe footer
    // are appended by the mail service when the campaign is sent.
    body: { type: String, required: true },
    type: {
        type: String,
        enum: ['newsletter', 'offer', 'course_alert', 'product_update', 'reengagement'],
        default: 'newsletter'
    },
    // Audience definition. Empty arrays = "any". `allActive` true sends to
    // every active subscriber regardless of preferences/interests.
    audience: {
        allActive: { type: Boolean, default: false },
        preferences: [{ type: String }],   // match if subscriber has ANY of these
        categoryInterests: [{ type: String }] // match if subscriber has ANY of these
    },
    status: {
        type: String,
        enum: ['draft', 'sending', 'sent', 'failed'],
        default: 'draft',
        index: true
    },
    // Outcome stats — populated when the campaign is sent
    stats: {
        recipients: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        opens: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    sentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
