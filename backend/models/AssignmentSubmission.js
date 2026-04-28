const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Assignment',
        required: true
    },
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
    content: {
        type: String // Link or text
    },
    attachments: [{
        name: String,
        url: String
    }],
    grade: {
        type: String, // or Number
        default: 'Not Graded'
    },
    feedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'returned'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);
