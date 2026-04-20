const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please provide a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: [true, 'Please provide a discount value']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Please provide an expiry date']
    },
    maxUses: {
        type: Number,
        default: 100
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
    return Date.now() > this.expiresAt;
});

module.exports = mongoose.model('Coupon', couponSchema);
