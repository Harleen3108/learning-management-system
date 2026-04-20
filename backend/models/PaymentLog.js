const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'processed'],
        default: 'processed'
    },
    payload: {
        type: Object,
        required: true
    },
    error: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
