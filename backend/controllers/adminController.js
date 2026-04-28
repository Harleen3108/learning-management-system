const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AuditLog = require('../models/AuditLog');
const Certificate = require('../models/Certificate');
const Coupon = require('../models/Coupon');
const PaymentLog = require('../models/PaymentLog');
const Review = require('../models/Review');
const LiveClass = require('../models/LiveClass');
const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Result = require('../models/Result');
const Progress = require('../models/Progress');
const Ticket = require('../models/Ticket');
const InstructorApplication = require('../models/InstructorApplication');
const mongoose = require('mongoose');

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
        const { role, status, search, instructorStatus } = req.query;
        let query = {};

        if (role) query.role = role;
        if (instructorStatus) query.instructorStatus = instructorStatus;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const users = await User.find(query)
            .populate('linkedStudents', 'name email')
            .populate('linkedParent', 'name email')
            .sort('-createdAt');

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
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Handle password update if provided
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = req.body.password;
        }

        // Update other fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.role) {
            user.role = req.body.role;
            if (req.body.role === 'instructor' && !user.instructorStatus) {
                user.instructorStatus = 'approved';
            }
        }
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
        
        // Instructor fields
        if (req.body.instructorBio) user.instructorBio = req.body.instructorBio;
        if (req.body.instructorSpecialty) user.instructorSpecialty = req.body.instructorSpecialty;
        if (req.body.profilePhoto) user.profilePhoto = req.body.profilePhoto;
        if (req.body.socialLinks) user.socialLinks = req.body.socialLinks;
        if (req.body.instructorStatus) user.instructorStatus = req.body.instructorStatus;

        await user.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_USER',
            resource: 'User',
            details: `Updated user ${user.email}${req.body.password ? ' including password reset' : ''}`,
            entityId: user._id
        });

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const { linkParent } = require('../utils/parentLinker');

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, dob, parentEmail, parentPhone, parentName } = req.body;

        const user = await User.create({
            name,
            email,
            password: password || 'Welcome123!', // Default password
            role: role || 'student',
            dob,
            instructorStatus: role === 'instructor' ? 'approved' : undefined
        });

        // Link parent if student
        if (user.role === 'student' && (parentEmail || parentPhone)) {
            await linkParent(user, { email: parentEmail, phone: parentPhone, name: parentName });
        }

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

// @desc    Hard delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'HARD_DELETE_USER',
            resource: 'User',
            resourceId: user._id,
            details: `Permanently deleted user ${user.email}`
        });

        res.status(200).json({ success: true, message: 'User permanently deleted' });
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
        const { status, search } = req.query;
        let query = {};
        if (status) query.status = status;
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort('-createdAt')
            .lean();

        // Enrich with real stats
        const enrichedCourses = await Promise.all(courses.map(async (course) => {
            const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
            const reviewCount = await Review.countDocuments({ course: course._id });
            return {
                ...course,
                enrollmentCount,
                reviewCount
            };
        }));

        res.status(200).json({ success: true, count: enrichedCourses.length, data: enrichedCourses });
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

        // Broadcast new offer to all students
        try {
            const { notifyRoles } = require('../services/notify');
            const offerLabel = coupon.discountType === 'percentage'
                ? `${coupon.discountValue}% off`
                : `₹${coupon.discountValue} off`;
            await notifyRoles(['student'], {
                type: 'new_coupon',
                title: 'New offer just dropped 🎁',
                message: `Use code ${coupon.code} at checkout to get ${offerLabel}.`,
                link: '/dashboard/explore',
                entity: { type: 'Coupon', id: coupon._id }
            });
        } catch (e) { console.error('[notify] new coupon:', e.message); }

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
            { 
                $match: { 
                    $or: [
                        { role: 'instructor' }, 
                        { 
                            instructorStatus: 'pending',
                            instructorSpecialty: { $exists: true, $ne: '' }
                        }
                    ] 
                } 
            },
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
                    role: 1,
                    instructorStatus: 1,
                    instructorSpecialty: 1,
                    instructorBio: 1,
                    phone: 1,
                    profilePhoto: 1,
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

// @desc    Get single instructor full profile/analytics
// @route   GET /api/v1/admin/instructors/:id
// @access  Private (Admin)
exports.getInstructorProfile = async (req, res, next) => {
    try {
        const instructorId = new mongoose.Types.ObjectId(req.params.id);

        // 1. Basic profile
        const instructor = await User.findById(instructorId).select('-password');
        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }

        // Check if there's an application for this user
        const application = await InstructorApplication.findOne({ user: instructorId }).sort('-createdAt');

        // 2. Courses with per-course enrollment count & revenue
        const courses = await Course.aggregate([
            { $match: { instructor: instructorId, isActive: { $ne: false } } },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'enrollments'
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    enrollmentCount: { $size: '$enrollments' },
                    revenue: {
                        $sum: {
                            $map: {
                                input: '$enrollments',
                                as: 'e',
                                in: { $ifNull: ['$$e.amount', 0] }
                            }
                        }
                    },
                    avgRating: { $avg: '$reviews.rating' },
                    reviewCount: { $size: '$reviews' }
                }
            },
            { $project: { enrollments: 0, reviews: 0 } },
            { $sort: { createdAt: -1 } }
        ]);

        // 3. Aggregate totals
        const totalStudents = courses.reduce((s, c) => s + c.enrollmentCount, 0);
        const totalRevenue = courses.reduce((s, c) => s + c.revenue, 0);
        const avgRating = courses.length
            ? (courses.reduce((s, c) => s + (c.avgRating || 0), 0) / courses.filter(c => c.avgRating).length || 0)
            : 0;

        // 4. Reviews for instructor's courses
        const courseIds = courses.map(c => c._id);
        const reviews = await Review.find({ course: { $in: courseIds } })
            .populate('student', 'name')
            .populate('course', 'title')
            .sort('-createdAt')
            .limit(20);

        // 5. Activity logs (admin actions on this instructor + instructor's own resource logs)
        const activityLogs = await AuditLog.find({
            $or: [
                { entityId: instructorId.toString() },
                { resourceId: instructorId.toString() },
                { user: instructorId }
            ]
        })
            .populate('user', 'name role')
            .sort('-timestamp')
            .limit(30);

        // 6. Live classes
        const liveClasses = await LiveClass.find({ instructor: instructorId })
            .populate('course', 'title')
            .sort('-scheduledAt')
            .limit(10);

        // 7. Quiz stats via modules belonging to instructor's courses
        const modules = await Module.find({ course: { $in: courseIds } }).select('_id');
        const moduleIds = modules.map(m => m._id);
        const quizzes = await Quiz.find({ module: { $in: moduleIds } }).select('_id passingScore');
        const quizIds = quizzes.map(q => q._id);
        const results = await Result.find({ quiz: { $in: quizIds } });
        const totalAttempts = results.length;
        const avgScore = totalAttempts ? (results.reduce((s, r) => s + r.score, 0) / totalAttempts) : 0;
        const passRate = totalAttempts ? (results.filter(r => r.passed).length / totalAttempts) * 100 : 0;

        // 8. Student engagement – active students (have progress records)
        const activeStudentIds = await Progress.distinct('student', { course: { $in: courseIds } });
        const completedEnrollments = await Enrollment.countDocuments({
            course: { $in: courseIds },
            status: 'completed'
        });
        const completionRate = totalStudents > 0 ? (completedEnrollments / totalStudents) * 100 : 0;

        // 9. Monthly revenue trend (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Enrollment.aggregate([
            {
                $match: {
                    course: { $in: courseIds },
                    enrolledAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$enrolledAt' },
                        month: { $month: '$enrolledAt' }
                    },
                    revenue: { $sum: { $ifNull: ['$amount', 0] } },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const revenueTrend = monthlyRevenue.map(m => ({
            month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
            revenue: m.revenue,
            enrollments: m.enrollments
        }));

        // 10. Content flags / reported issues
        const flaggedReviews = reviews.filter(r => r.status === 'flagged');

        res.status(200).json({
            success: true,
            data: {
                profile: instructor,
                overview: {
                    totalCourses: courses.length,
                    totalStudents,
                    totalRevenue,
                    avgRating: parseFloat(avgRating.toFixed(1)) || 0
                },
                courses,
                studentEngagement: {
                    totalStudents,
                    activeStudents: activeStudentIds.length,
                    completionRate: parseFloat(completionRate.toFixed(1))
                },
                revenue: {
                    total: totalRevenue,
                    trend: revenueTrend,
                    perCourse: courses.map(c => ({ title: c.title, revenue: c.revenue, enrollments: c.enrollmentCount }))
                },
                reviews,
                liveClasses,
                quizStats: {
                    totalQuizzes: quizzes.length,
                    totalAttempts,
                    avgScore: parseFloat(avgScore.toFixed(1)),
                    passRate: parseFloat(passRate.toFixed(1))
                },
                activityLogs,
                flaggedContent: flaggedReviews,
                application: application
            }
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
        
        const instructor = await User.findById(req.params.id);
        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }

        instructor.instructorStatus = status;
        if (status === 'approved') {
            // Only change role if user is not already an admin
            if (instructor.role !== 'admin' && instructor.role !== 'super-admin') {
                instructor.role = 'instructor';
            }
            instructor.password = '12345678'; // Set default password
        }

        await instructor.save();

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
// @desc    Get detailed user profile/analytics (Student/Parent)
// @route   GET /api/v1/admin/users/:id/analytics
// @access  Private (Admin)
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);

        // 1. Basic profile + Linked Students (if parent)
        const user = await User.findById(userId)
            .select('-password')
            .populate('linkedStudents', 'name email role isActive');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Find Parents (if student)
        let linkedParents = [];
        if (user.role === 'student') {
            linkedParents = await User.find({ 
                role: 'parent', 
                linkedStudents: userId 
            }).select('name email isActive');
        }

        // 3. Enrollments with course & progress details
        const enrollments = await Enrollment.find({ user: userId })
            .populate({
                path: 'course',
                select: 'title thumbnail instructor',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort('-enrolledAt');

        // Calculate Overview Stats
        const totalEnrolled = enrollments.length;
        const totalCompleted = enrollments.filter(e => e.status === 'completed').length;
        const totalSpent = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);

        // 4. Progress Tracking Details
        const courseProgress = await Progress.find({ student: userId })
            .populate('course', 'title');

        // 5. Quiz Performance
        const quizResults = await Result.find({ student: userId })
            .populate({
                path: 'quiz',
                select: 'title passingScore',
                populate: { path: 'module', select: 'title' }
            })
            .sort('-attemptedAt');

        const quizStats = {
            totalAttempts: quizResults.length,
            avgScore: quizResults.length ? (quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length).toFixed(1) : 0,
            passRate: quizResults.length ? ((quizResults.filter(r => r.passed).length / quizResults.length) * 100).toFixed(1) : 0
        };

        // 6. Payments/Transactions
        // (Enrollment models usually contain payment info in this system)
        const payments = enrollments.map(e => ({
            id: e._id,
            course: e.course?.title,
            amount: e.amount,
            status: e.status === 'refunded' ? 'refunded' : 'success', // Simple mapping
            date: e.enrolledAt,
            transactionId: e.paymentId || 'N/A' // Assuming paymentId exists in Enrollment
        }));

        // 7. Certificates
        const certificates = await Certificate.find({ student: userId })
            .populate('course', 'title')
            .sort('-issueDate');

        // 8. Support Tickets
        const tickets = await Ticket.find({ user: userId })
            .sort('-createdAt');

        // 9. Activity Logs (Login, Course Access, etc.)
        const activityLogs = await AuditLog.find({ user: userId })
            .sort('-timestamp')
            .limit(50);

        const lastActive = activityLogs.length > 0 ? activityLogs[0].timestamp : user.createdAt;

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    ...user._doc,
                    linkedParents
                },
                overview: {
                    totalEnrolled,
                    totalCompleted,
                    totalSpent,
                    lastActive
                },
                enrollments,
                progress: courseProgress,
                quizPerformance: {
                    stats: quizStats,
                    results: quizResults
                },
                payments,
                certificates,
                tickets,
                activityLogs,
                linkedAccounts: {
                    students: user.linkedStudents || [],
                    parents: linkedParents
                }
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
