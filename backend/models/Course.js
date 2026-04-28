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
    discountPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide a category']
    },
    subcategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        trim: true
    },
    topics: [{
        type: String,
        trim: true
    }],
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
        enum: ['draft', 'pending', 'published', 'rejected', 'needs changes', 'archived'],
        default: 'draft'
    },
    submissionDate: Date,
    reviewDeadline: Date,
    qualityScores: {
        completeness: { type: Number, default: 0 },
        quality: { type: Number, default: 0 },
        compliance: { type: Number, default: 0 }
    },
    checklist: {
        titleQuality: { type: Boolean, default: false },
        thumbnailQuality: { type: Boolean, default: false },
        descriptionQuality: { type: Boolean, default: false },
        curriculumQuality: { type: Boolean, default: false },
        mediaQuality: { type: Boolean, default: false },
        pricingValidity: { type: Boolean, default: false }
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    tagline: {
        type: String,
        trim: true,
        maxlength: [100, 'Tagline cannot be more than 100 characters']
    },
    whatYouWillLearn: [{
        type: String,
        trim: true
    }],
    requirements: [{
        type: String,
        trim: true
    }],
    targetAudience: [{
        type: String,
        trim: true
    }],
    language: {
        type: String,
        default: 'English'
    },
    feedback: {
        type: String,
        trim: true
    },
    feedbackHistory: [{
        content: String,
        admin: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        },
        statusAtTime: String
    }],
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
