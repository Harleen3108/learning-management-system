const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AuditLog = require('../models/AuditLog');
const Certificate = require('../models/Certificate');
const Coupon = require('../models/Coupon');
const PaymentLog = require('../models/PaymentLog');
const Review = require('../models/Review');

// @desc    Get all reviews aggregate stats
// @route   GET /api/v1/admin/reviews/stats
// @access  Private (Admin)
exports.getReviewStats = async (req, res, next) => {
    try {
        const totalReviews = await Review.countDocuments({ status: { $ne: 'deleted' } });
        
        // Distribution (1-5 star counts)
        const distribution = await Review.aggregate([
            { $match: { status: { $ne: 'deleted' } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        // Map distribution to a fixed array [5, 4, 3, 2, 1]
        const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach(d => distMap[d._id] = d.count);
        
        const avgRating = await Review.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        const stats = {
            total: totalReviews,
            average: avgRating[0] ? avgRating[0].avg.toFixed(1) : 0,
            distribution: [5, 4, 3, 2, 1].map(star => ({
                star,
                count: distMap[star],
                percentage: totalReviews > 0 ? Math.round((distMap[star] / totalReviews) * 100) : 0
            })),
            pendingCount: await Review.countDocuments({ status: 'flagged' })
        };

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeStudents = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();
        const pendingCourses = await Course.countDocuments({ status: 'pending' });
        
        // Revenue calculation (Example: Sum of all enrollment prices)
        const enrollments = await Enrollment.find();
        const totalRevenue = enrollments.reduce((sum, item) => sum + (item.amount || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeStudents,
                totalCourses,
                pendingCourses,
                totalRevenue,
                systemHealth: '99.9%',
                pendingApprovals: pendingCourses
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all users with filtering
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const { role, status, search } = req.query;
        let query = {};

        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user (Block/Role/Update)
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_USER',
            resource: 'User',
            details: `Updated user ${user.email}`,
            entityId: user._id
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await User.create({
            name,
            email,
            password: password || 'Welcome123!', // Default password
            role: role || 'student'
        });

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'CREATE_USER',
            resource: 'User',
            resourceId: user._id,
            details: `Created user ${user.email} as ${user.role}`
        });

        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Soft delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'DELETE_USER',
            resource: 'User',
            resourceId: user._id,
            details: `Soft deleted user ${user.email}`
        });

        res.status(200).json({ success: true, message: 'User deactivated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all transactions
// @route   GET /api/v1/admin/transactions
// @access  Private (Admin)
exports.getTransactions = async (req, res, next) => {
    try {
        const transactions = await Enrollment.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Process refund
// @route   POST /api/v1/admin/transactions/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Here you would call Razorpay Refund API
        // For now, we simulate success
        enrollment.status = 'refunded';
        await enrollment.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'PROCESS_REFUND',
            details: `Refunded transaction ${enrollment._id}`,
            entityId: enrollment._id
        });

        res.status(200).json({ success: true, message: 'Refund processed successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all courses with status filtering
// @route   GET /api/v1/admin/courses
// @access  Private (Admin)
exports.getCoursesAdmin = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get audit logs
// @route   GET /api/v1/admin/logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
    try {
        const { userId, action } = req.query;
        let query = {};

        if (userId) query.resourceId = userId;
        if (action) query.action = action;

        const logs = await AuditLog.find(query)
            .populate('user', 'name role')
            .sort('-createdAt')
            .limit(100);

        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/v1/admin/coupons
// @access  Private (Admin)
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new coupon
// @route   POST /api/v1/admin/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/admin/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get payment webhook logs
// @route   GET /api/v1/admin/payments/logs
// @access  Private (Admin)
exports.getPaymentLogs = async (req, res, next) => {
    try {
        const logs = await PaymentLog.find().sort('-createdAt').limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all instructors with stats
// @route   GET /api/v1/admin/instructors
// @access  Private (Admin)
exports.getInstructors = async (req, res, next) => {
    try {
        const instructors = await User.aggregate([
            { $match: { role: 'instructor' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'instructor',
                    as: 'courses'
                }
            },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: 'courses._id',
                    foreignField: 'course',
                    as: 'enrollments'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    instructorStatus: 1,
                    instructorSpecialty: 1,
                    instructorBio: 1,
                    createdAt: 1,
                    courseCount: { $size: '$courses' },
                    studentCount: { $size: '$enrollments' },
                    averageRating: { $avg: '$courses.averageRating' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: instructors.length,
            data: instructors
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update instructor status (Approve/Reject)
// @route   PUT /api/v1/admin/instructors/:id/status
// @access  Private (Admin)
exports.updateInstructorStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        const instructor = await User.findByIdAndUpdate(req.params.id, {
            instructorStatus: status
        }, {
            new: true,
            runValidators: true
        });

        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_INSTRUCTOR_STATUS',
            resource: 'User',
            details: `Updated instructor ${instructor.email} status to ${status}`,
            entityId: instructor._id
        });

        res.status(200).json({ success: true, data: instructor });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all certificates
// @route   GET /api/v1/admin/certificates
// @access  Private (Admin)
exports.getCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find()
            .populate('student', 'name email')
            .populate('course', 'title')
            .sort('-issueDate');

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Revoke certificate
// @route   PUT /api/v1/admin/certificates/:id/revoke
// @access  Private (Admin)
exports.revokeCertificate = async (req, res, next) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        certificate.status = 'revoked';
        await certificate.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'REVOKE_CERTIFICATE',
            resource: 'Certificate',
            details: `Revoked certificate ${certificate.certificateId} for course ${certificate.course}`,
            entityId: certificate._id
        });

        res.status(200).json({ success: true, data: certificate });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all platform settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await Setting.find();
        
        // If no settings exist yet, create some defaults
        if (settings.length === 0) {
            const defaults = [
                { key: 'platformName', value: 'EduFlow LMS', category: 'general', description: 'Display name of the platform' },
                { key: 'contactEmail', value: 'admin@eduflow.com', category: 'general', description: 'Official support email' },
                { key: 'maintenanceMode', value: false, category: 'features', description: 'Disable frontend access for maintenance' },
                { key: 'instructorDirectRegistration', value: true, category: 'features', description: 'Allow users to register as instructors without admin invite' }
            ];
            const created = await Setting.insertMany(defaults);
            return res.status(200).json({ success: true, count: created.length, data: created });
        }

        res.status(200).json({ success: true, count: settings.length, data: settings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update platform settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res, next) => {
    try {
        const { settings } = req.body; // Array of { key, value }

        const updatePromises = settings.map(item => 
            Setting.findOneAndUpdate(
                { key: item.key }, 
                { value: item.value, updatedBy: req.user.id, updatedAt: Date.now() },
                { new: true, upsert: true }
            )
        );

        const updatedSettings = await Promise.all(updatePromises);

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_SYSTEM_SETTINGS',
            resource: 'Settings',
            details: `Updated ${updatedSettings.length} system configurations`
        });

        res.status(200).json({ success: true, data: updatedSettings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get global content monitoring (Courses/Modules/Lessons)
// @route   GET /api/v1/admin/content/monitoring
// @access  Private (Admin)
exports.getContentMonitoring = async (req, res, next) => {
    try {
        const lessons = await Lesson.find()
            .populate({
                path: 'module',
                populate: { path: 'course', select: 'title' }
            })
            .sort('-createdAt');

        res.status(200).json({ 
            success: true, 
            count: lessons.length, 
            data: lessons 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
