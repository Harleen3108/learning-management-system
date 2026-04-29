const mongoose = require('mongoose');
const crypto = require('crypto');

// Allowed preference / interest tags. Kept as strings (not refs) so the
// list is portable and easy to filter in plain queries.
const PREFERENCES = [
    'newsletter',       // Weekly newsletter
    'new_courses',      // New course alerts
    'offers',           // Discounts & offers
    'learning_tips',    // Learning tips
    'product_updates'   // Product updates
];

const INTERESTS = ['AI', 'Design', 'Development', 'Marketing', 'Business', 'Data', 'Other'];

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email']
    },
    name: { type: String, trim: true },
    type: {
        type: String,
        enum: ['visitor', 'student', 'instructor', 'parent'],
        default: 'visitor'
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed'],
        default: 'active',
        index: true
    },
    preferences: [{
        type: String,
        enum: PREFERENCES
    }],
    categoryInterests: [{
        type: String,
        trim: true
    }],
    source: { type: String, default: 'website' }, // where they signed up — 'website', 'checkout', 'admin-import', etc.
    // Linked user (if the subscriber also has an EduFlow account)
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    // Token used in unsubscribe / manage-preferences URLs.
    // 32 hex chars — guessable would still need to match an existing email.
    unsubscribeToken: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    // Engagement counters
    engagement: {
        opens: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        lastOpenedAt: Date,
        lastClickedAt: Date,
        lastEngagedAt: Date
    },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date
}, { timestamps: true });

subscriberSchema.index({ status: 1, preferences: 1 });
subscriberSchema.index({ categoryInterests: 1 });

subscriberSchema.statics.PREFERENCES = PREFERENCES;
subscriberSchema.statics.INTERESTS = INTERESTS;

module.exports = mongoose.model('Subscriber', subscriberSchema);
