const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: 1000
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    isSpam: {
        type: Boolean,
        default: false
    },
    sentimentLabel: {
        type: String,
        enum: ['Positive', 'Constructive', 'Neutral', 'Spam'],
        default: 'Neutral'
    },
    status: {
        type: String,
        enum: ['active', 'flagged', 'deleted'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-detect spam and label sentiment before saving
reviewSchema.pre('save', function(next) {
    const spamKeywords = ['click link', 'money back', 'free offer', 'spam-link.com', 'http://', 'https://'];
    const content = (this.title + ' ' + this.comment).toLowerCase();
    
    const containsSpam = spamKeywords.some(keyword => content.includes(keyword));
    
    if (containsSpam) {
        this.isSpam = true;
        this.sentimentLabel = 'Spam';
        this.status = 'flagged';
    } else if (this.rating >= 4) {
        this.sentimentLabel = 'Positive';
    } else if (this.rating <= 3) {
        this.sentimentLabel = 'Constructive';
    }
    
    next();
});

// Prevent student from submitting more than one review per course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(courseId) {
    const obj = await this.aggregate([
        {
            $match: { course: courseId, status: 'active' }
        },
        {
            $group: {
                _id: '$course',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Course').findByIdAndUpdate(courseId, {
            averageRating: obj[0] ? obj[0].averageRating : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.course);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', async function() {
    await this.constructor.getAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);
