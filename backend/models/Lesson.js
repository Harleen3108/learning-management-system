const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a lesson title'],
        trim: true
    },
    description: String,
    videoUrl: {
        type: String,
        required: [true, 'Please provide a video URL']
    },
    videoPublicId: String, // Added for secure signed URL generation
    videoAccessType: {
        type: String,
        enum: ['upload', 'authenticated'],
        default: 'upload'
    },
    duration: Number, // in seconds
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

module.exports = mongoose.model('Lesson', lessonSchema);
