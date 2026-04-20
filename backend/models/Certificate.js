const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    certificateId: {
        type: String,
        unique: true,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    url: String, // Link to generated PDF in Cloudinary
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);
