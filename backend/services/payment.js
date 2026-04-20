const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {Number} amount 
 * @param {String} currency 
 */
exports.createOrder = async (amount, currency = 'INR') => {
    const options = {
        amount: amount * 100, // Amount in paise
        currency,
        receipt: `receipt_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (err) {
        throw new Error(err.message);
    }
};

/**
 * Verify Razorpay signature
 * @param {String} orderId 
 * @param {String} paymentId 
 * @param {String} signature 
 */
exports.verifySignature = (orderId, paymentId, signature) => {
    if (!orderId || !paymentId || !signature) return false;
    
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};
