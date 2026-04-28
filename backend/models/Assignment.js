const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add an assignment title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    dueDate: {
        type: Date,
        required: [true, 'Please add a due date']
    },
    attachments: [{
        name: String,
        url: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

assignmentSchema.index({ course: 1, instructor: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
