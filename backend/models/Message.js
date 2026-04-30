const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String, // format: "courseId-studentId-instructorId" or similar unique string
        required: true
    },
    // Course-scoped messages tie a thread to a specific class. Direct messages
    // (e.g. from a student visiting an instructor's public profile) leave this empty.
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    },
    // 'course' = scoped to a course thread, 'direct' = free-form student↔instructor chat.
    kind: {
        type: String,
        enum: ['course', 'direct'],
        default: 'course'
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Please add a message text']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
