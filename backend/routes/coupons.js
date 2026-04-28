const express = require('express');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Validate a coupon code (used by students at checkout)
// @route   POST /api/v1/coupons/validate
// @access  Private (any authenticated user)
router.post('/validate', protect, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
        }
        if (Date.now() > new Date(coupon.expiresAt).getTime()) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }
        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
        }

        return res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });
    } catch (err) {
        console.error('Coupon validate error:', err);
        return res.status(500).json({ success: false, message: 'Failed to validate coupon' });
    }
});

module.exports = router;
