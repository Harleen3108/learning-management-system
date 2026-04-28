const mongoose = require('mongoose');

const instructorSettingsSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profile: {
        displayName: { type: String, trim: true },
        headline: { type: String, trim: true },
        bio: { type: String, trim: true },
        expertise: [{ type: String, trim: true }],
        language: { type: String, default: 'English' },
        socialLinks: {
            website: String,
            linkedin: String,
            twitter: String,
            youtube: String
        }
    },
    account: {
        phone: { type: String, trim: true },
        country: { type: String, default: 'United States' },
        timezone: { type: String, default: 'UTC' }
    },
    payout: {
        method: { type: String, enum: ['Bank Transfer', 'UPI', 'Stripe', 'PayPal'], default: 'Bank Transfer' },
        details: {
            accountName: String,
            accountNumber: String,
            routingNumber: String,
            bankName: String,
            upiId: String,
            paypalEmail: String
        },
        taxInfo: {
            taxId: String,
            taxCountry: String
        }
    },
    notifications: {
        emailAlerts: {
            enrollments: { type: Boolean, default: true },
            reviews: { type: Boolean, default: true },
            assignments: { type: Boolean, default: true },
            qna: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true }
        }
    },
    coursePreferences: {
        defaultVisibility: { type: String, enum: ['public', 'private', 'draft'], default: 'draft' },
        defaultLanguage: { type: String, default: 'English' },
        defaultPricing: { type: String, enum: ['paid', 'free'], default: 'paid' },
        discussionsEnabled: { type: Boolean, default: true },
        reviewsEnabled: { type: Boolean, default: true }
    },
    integrations: {
        zoomConnected: { type: Boolean, default: false },
        googleMeetConnected: { type: Boolean, default: false },
        calendarSync: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

instructorSettingsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('InstructorSettings', instructorSettingsSchema);
