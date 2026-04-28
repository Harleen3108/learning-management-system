const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson'
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: [true, 'Please add a question'],
        trim: true
    },
    replies: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isAnswered: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for filtering by instructor and course
qnaSchema.index({ instructor: 1, course: 1 });
qnaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QnA', qnaSchema);
