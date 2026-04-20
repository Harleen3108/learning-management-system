const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a module title'],
        trim: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cascade delete lessons when a module is deleted
moduleSchema.pre('remove', async function(next) {
    await this.model('Lesson').deleteMany({ module: this._id });
    next();
});

// Reverse populate with virtuals
moduleSchema.virtual('lessons', {
    ref: 'Lesson',
    localField: '_id',
    foreignField: 'module',
    justOne: false
});

moduleSchema.virtual('quizzes', {
    ref: 'Quiz',
    localField: '_id',
    foreignField: 'module',
    justOne: false
});

module.exports = mongoose.model('Module', moduleSchema);
