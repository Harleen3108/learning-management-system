const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
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
        required: [true, 'Please add a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    scheduledFor: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

announcementSchema.index({ course: 1, scheduledFor: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
