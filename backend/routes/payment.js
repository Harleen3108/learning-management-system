const express = require('express');
const Enrollment = require('../models/Enrollment');
const PaymentLog = require('../models/PaymentLog');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// @desc    Razorpay Webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (Secret verified)
router.post('/webhook', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Optional: Verify signature if secret is provided
    if (secret && signature) {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    }

    const { event, payload } = req.body;
    
    try {
        // Log the event
        const logData = {
            event,
            payload,
            status: 'processed'
        };

        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            logData.razorpayPaymentId = payment.id;
            logData.razorpayOrderId = payment.order_id;
            logData.amount = payment.amount / 100;
            logData.status = 'success';
            
            // Update enrollment if it exists
            await Enrollment.findOneAndUpdate(
                { orderId: payment.order_id },
                { status: 'completed', paymentId: payment.id }
            );
        } else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            logData.status = 'failed';
            logData.error = payment.error_description;
            
            await Enrollment.findOneAndUpdate(
                { orderId: payment.order_id },
                { status: 'cancelled' }
            );
        }

        await PaymentLog.create(logData);
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
