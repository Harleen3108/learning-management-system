const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
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
        required: [true, 'Please provide a title for the live class']
    },
    description: String,
    meetingUrl: {
        type: String,
        required: [true, 'Please provide a meeting URL (Zoom/Meet)']
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please provide a date and time']
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LiveClass', liveClassSchema);
