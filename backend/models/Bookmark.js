const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure unique bookmark per student per lesson
bookmarkSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
