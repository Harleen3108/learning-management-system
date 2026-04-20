const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please provide a category']
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    thumbnail: {
        type: String,
        default: 'no-photo.jpg'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'rejected'],
        default: 'draft'
    },
    feedback: {
        type: String,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating can not be more than 5']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Query middleware to exclude inactive courses by default
courseSchema.pre(/^find/, function(next) {
    this.find({ isActive: { $ne: false } });
    next();
});

// Cascade delete modules when a course is deleted (Original behavior for hard deletes)
courseSchema.pre('remove', async function(next) {
    console.log(`Modules being removed from course ${this._id}`);
    await this.model('Module').deleteMany({ course: this._id });
    next();
});

// Reverse populate with virtuals
courseSchema.virtual('modules', {
    ref: 'Module',
    localField: '_id',
    foreignField: 'course',
    justOne: false
});

// Indexes for optimization
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
