const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');

// @desc    List the user's purchases (paid + free enrollments) with payment info
// @route   GET /api/v1/profile/purchases
// @access  Private
exports.getMyPurchases = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate({
                path: 'course',
                select: 'title thumbnail price discountPrice instructor',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort('-enrolledAt')
            .lean();

        // Shape the rows: include enrollment+course+payment info
        const rows = enrollments
            .filter(e => e.course) // drop dangling enrollments whose course was deleted
            .map(e => ({
                _id: e._id,
                course: e.course,
                amount: e.amount || 0,
                status: e.status,
                paymentId: e.paymentId || null,
                orderId: e.orderId || null,
                enrolledAt: e.enrolledAt
            }));

        const totalSpent = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

        res.status(200).json({
            success: true,
            count: rows.length,
            totalSpent,
            data: rows
        });
    } catch (err) {
        console.error('getMyPurchases error:', err);
        res.status(500).json({ success: false, message: 'Failed to load purchases' });
    }
};

// @desc    Get the current user's profile (full)
// @route   GET /api/v1/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Quick stats so the profile page can show "X enrolled, Y completed"
        const enrollments = await Enrollment.find({ student: user._id, status: 'completed' });
        const completedLessons = await Progress.countDocuments({ student: user._id, isCompleted: true });

        res.status(200).json({
            success: true,
            data: {
                ...user,
                stats: {
                    enrolledCount: enrollments.length,
                    completedLessons
                }
            }
        });
    } catch (err) {
        console.error('getMyProfile error:', err);
        res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
};

// @desc    Update the current user's profile (any subset of profile.* fields)
// @route   PUT /api/v1/profile/me
// @access  Private
exports.updateMyProfile = async (req, res) => {
    try {
        const allowedTop = ['name', 'phone', 'profilePhoto', 'instructorBio', 'instructorSpecialty', 'socialLinks'];
        const allowedProfile = [
            'about', 'occupation', 'interests', 'resumeUrl',
            'links', 'workPreferences', 'workHistory', 'education', 'isPublic'
        ];

        const update = {};
        // Top-level fields
        for (const key of allowedTop) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }
        // Nested profile fields — merge into the existing profile sub-doc
        if (req.body.profile && typeof req.body.profile === 'object') {
            for (const key of allowedProfile) {
                if (req.body.profile[key] !== undefined) {
                    update[`profile.${key}`] = req.body.profile[key];
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: true }
        ).lean();

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('updateMyProfile error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get a public profile by user id (for the share link)
// @route   GET /api/v1/profile/public/:id
// @access  Public
exports.getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name profilePhoto profile instructorBio instructorSpecialty role')
            .lean();
        if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
        if (user.profile && user.profile.isPublic === false) {
            return res.status(403).json({ success: false, message: 'This profile is private' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error('getPublicProfile error:', err);
        res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
};
