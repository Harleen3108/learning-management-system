const mongoose = require('mongoose');

// Sub-document for assignment-type lessons.
// Mirrors Coursera-style "Practice Assignment": MCQ questions with per-question marks,
// limited attempts, and best-of-attempts grading.
const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true, trim: true },
    options: [{
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false }
    }],
    explanation: { type: String, trim: true },
    marks: { type: Number, default: 1, min: 0 }
}, { _id: true });

const AssignmentBlockSchema = new mongoose.Schema({
    instructions: { type: String, trim: true },
    questions: [QuestionSchema],
    maxAttempts: { type: Number, default: 5, min: 1 },
    passingScore: { type: Number, default: 50, min: 0, max: 100 } // percentage
}, { _id: false });

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a lesson title'],
        trim: true
    },
    description: String,

    // Lesson type drives which content fields are required and how the LearningPage renders.
    // 'video'      → uses videoUrl
    // 'reading'    → uses readingContent (rich text / markdown) + readingMinutes
    // 'assignment' → uses the assignment sub-document (questions, maxAttempts, passingScore)
    type: {
        type: String,
        enum: ['video', 'reading', 'assignment'],
        default: 'video'
    },

    // ── Video fields (only required when type === 'video') ──
    videoUrl: {
        type: String,
        required: function () { return this.type === 'video'; }
    },
    videoPublicId: String,
    videoAccessType: {
        type: String,
        enum: ['upload', 'authenticated'],
        default: 'upload'
    },

    // ── Reading fields ──
    readingContent: { type: String },        // HTML / markdown body
    readingMinutes: { type: Number, default: 4 }, // estimated reading time, shown as "Reading • 4 min"

    // ── Assignment block ──
    assignment: { type: AssignmentBlockSchema, default: undefined },

    // ── Common ──
    duration: Number, // in seconds (for video) — display string built on the fly for others
    // Instructor-provided notes shown to students under the Notes tab.
    notes: { type: String, default: '' },
    // Downloadable resources visible under the Downloads tab.
    downloads: [{
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true }
    }],
    attachments: [{
        name: String,
        url: String
    }],
    feedback: {
        type: String,
        trim: true
    },
    module: {
        type: mongoose.Schema.ObjectId,
        ref: 'Module',
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save guard: keep type-specific fields tidy
lessonSchema.pre('save', function (next) {
    if (this.type !== 'video') {
        // Don't keep stale video fields on reading/assignment lessons
        if (!this.isModified('videoUrl')) this.videoUrl = this.videoUrl || undefined;
    }
    if (this.type !== 'assignment') {
        this.assignment = undefined;
    }
    if (this.type !== 'reading') {
        // readingMinutes is harmless to keep; clear content to avoid leaking old drafts
        if (!this.readingContent) this.readingContent = undefined;
    }
    next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
