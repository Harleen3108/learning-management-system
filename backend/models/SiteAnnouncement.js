const mongoose = require('mongoose');

// EduFlow site-wide announcement bar — admin-managed.
// Renders at the top of the public landing/navigation. Only one is shown at a time
// (the highest-priority, non-expired, active row).
const SiteAnnouncementSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'Announcement text is required'],
        trim: true,
        maxlength: 240
    },
    // Visual accent — controls left chip + highlighted text. Stored as named theme keys
    // so the UI is not locked to one shade. Frontend resolves these to Tailwind classes.
    theme: {
        type: String,
        enum: ['flash', 'offer', 'launch', 'holiday', 'info', 'maintenance'],
        default: 'flash'
    },
    // Optional CTA button. Both text + href required for the button to render.
    ctaText: { type: String, trim: true, maxlength: 40 },
    ctaHref: { type: String, trim: true, maxlength: 500 },
    // Optional countdown — when present the bar shows a live counter ending at this date.
    countdownTo: { type: Date },
    // Hard expiry — admin can set "auto-disable after X". Null = no expiry.
    expiresAt: { type: Date },
    // Whether the bar should currently be served.
    isActive: { type: Boolean, default: true, index: true },
    // When more than one row qualifies, highest priority wins.
    priority: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Lookup for "the announcement to show right now"
SiteAnnouncementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('SiteAnnouncement', SiteAnnouncementSchema);
