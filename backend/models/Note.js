const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: [true, 'Please provide note content']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);
