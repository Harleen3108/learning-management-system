const mongoose = require('mongoose');

// One Progress row per (student, lesson) pair.
// Tracks completion state across all three lesson types (video / reading / assignment).
const AttemptSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },          // earned marks
    totalMarks: { type: Number, default: 0 },     // out of
    percentage: { type: Number, default: 0 },     // 0-100
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    answers: [{                                   // per-question record
        questionId: { type: mongoose.Schema.Types.ObjectId },
        selectedOptionIndex: Number,
        isCorrect: Boolean
    }],
    passed: { type: Boolean, default: false },
    attemptedAt: { type: Date, default: Date.now }
}, { _id: true });

const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },

    // Last position for video lessons (resume support)
    lastWatchedTime: {
        type: Number,
        default: 0 // seconds
    },

    // Universal completion flag (set true once a lesson is "done" regardless of type)
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: { type: Date },

    // Reading lessons → set true when student presses "Mark as completed"
    markedAsRead: { type: Boolean, default: false },

    // Assignment lessons → all attempts kept, plus best score for quick reads
    attempts: [AttemptSchema],
    bestScore: { type: Number, default: 0 },        // best percentage 0-100
    bestAttemptAt: { type: Date },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// One row per (student, lesson)
progressSchema.index({ student: 1, lesson: 1 }, { unique: true });
// Quick course-level rollup for the curriculum sidebar
progressSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('Progress', progressSchema);
