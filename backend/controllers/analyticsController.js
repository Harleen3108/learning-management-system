const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

// @desc    Get comprehensive admin analytics
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin/Super-Admin)
exports.getAdminAnalytics = async (req, res, next) => {
    // Each block is wrapped in safe() so a single failing aggregate doesn't take down
    // the whole endpoint with a 400 — the dashboard renders zeros for that section
    // and the rest still loads.
    const safe = async (fn, fallback) => {
        try { return await fn(); }
        catch (err) {
            console.error('[Analytics] Sub-query failed:', err.message);
            return fallback;
        }
    };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // 1. KPI Cards
        const totalUsers           = await safe(() => User.countDocuments(), 0);
        const activeStudents       = await safe(() => User.countDocuments({ role: 'student' }), 0);
        const totalCourses         = await safe(() => Course.countDocuments(), 0);
        const pendingInstructors   = await safe(() => User.countDocuments({ instructorStatus: 'pending' }), 0);
        const newSignupsToday      = await safe(() => User.countDocuments({ createdAt: { $gte: today } }), 0);

        const revenueResult = await safe(() => Enrollment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]), []);
        const totalRevenue = revenueResult[0]?.total || 0;

        const totalProgress     = await safe(() => Progress.countDocuments(), 0);
        const completedProgress = await safe(() => Progress.countDocuments({ isCompleted: true }), 0);
        const completionRate    = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

        // 2. User Growth (last 6 months)
        const userGrowth = await safe(() => User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%b', date: '$createdAt' } },
                    value: { $sum: 1 },
                    sortKey: { $min: '$createdAt' }
                }
            },
            { $sort: { sortKey: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
        ]), []);

        // 3. Course Performance (top 5 by enrollment)
        const coursePerformance = await safe(() => Enrollment.aggregate([
            { $group: { _id: '$course', value: { $sum: 1 } } },
            { $sort: { value: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: false } },
            { $project: { _id: 0, label: '$courseInfo.title', value: 1 } }
        ]), []);

        // 4. Instructor Performance (top 5 by revenue)
        const instructorPerformance = await safe(() => Enrollment.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$courseInfo.instructor', value: { $sum: '$amount' } } },
            { $sort: { value: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false } },
            { $project: { _id: 0, label: '$userInfo.name', value: 1 } }
        ]), []);

        // 5. Revenue Monthly (last 6 months)
        const revenueMonthly = await safe(() => Enrollment.aggregate([
            { $match: { enrolledAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%b', date: '$enrolledAt' } },
                    value: { $sum: '$amount' },
                    sortKey: { $min: '$enrolledAt' }
                }
            },
            { $sort: { sortKey: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
        ]), []);

        // 6. Engagement (last 7 days)
        const engagementData = await safe(() => Enrollment.aggregate([
            { $match: { enrolledAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%a', date: '$enrolledAt' } },
                    value: { $sum: 1 },
                    sortKey: { $min: '$enrolledAt' }
                }
            },
            { $sort: { sortKey: 1 } },
            { $project: { _id: 0, label: '$_id', value: 1 } }
        ]), []);

        // 7. Recent Activity Feed
        const activityFeed = await safe(
            () => AuditLog.find().populate('user', 'name').sort('-timestamp').limit(10),
            []
        );

        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalUsers,
                    activeStudents,
                    totalCourses,
                    totalRevenue,
                    completionRate,
                    newSignupsToday,
                    pendingInstructors
                },
                charts: {
                    userGrowth,
                    coursePerformance,
                    instructorPerformance,
                    revenueMonthly,
                    engagementData
                },
                activityFeed: (activityFeed || []).map(log => ({
                    id: log._id,
                    type: log.action,
                    text: log.details || `${log.user?.name || 'System'} performed ${log.action}`,
                    time: log.timestamp,
                    action: log.action
                }))
            }
        });
    } catch (err) {
        console.error('--- ADMIN ANALYTICS ERROR ---');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        console.error('--- END ---');
        res.status(500).json({ success: false, message: 'Failed to fetch analytics: ' + err.message });
    }
};

// @desc    Get instructor dashboard analytics
// @route   GET /api/v1/analytics/instructor
// @access  Private (Instructor/Admin)
exports.getInstructorAnalytics = async (req, res, next) => {
    try {
        // 1. Get all courses owned by this instructor
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        if (courses.length === 0) {
            return res.status(200).json({ success: true, data: { totalCourses: 0, totalStudents: 0, totalRevenue: 0, completionRate: 0, averageQuizScore: 0, courseBreakdown: [] } });
        }

        // 2. Total Students (Unique overall)
        const uniqueStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });
        
        // 3. Total Revenue
        const revenue = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 4. Monthly Revenue (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, enrolledAt: { $gte: sixMonthsAgo } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m", date: "$enrolledAt" } }, 
                    revenue: { $sum: "$amount" },
                    enrollments: { $sum: 1 }
                } 
            },
            { $sort: { "_id": 1 } }
        ]);

        // 5. Quiz Performance (Average)
        const quizzes = await require('../models/Quiz').find({ course: { $in: courseIds } }).select('_id');
        const quizIds = quizzes.map(q => q._id);
        const quizStats = await Result.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            { $group: { _id: null, avgScore: { $avg: '$score' }, totalAttempts: { $sum: 1 } } }
        ]);

        // 6. Course Breakdown (More detailed)
        // We find all enrollments for these courses and group them
        const courseStats = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { 
               $group: { 
                 _id: '$course', 
                 enrollments: { $sum: 1 }, 
                 revenue: { $sum: '$amount' }
               } 
            },
            {
               $lookup: {
                 from: 'courses',
                 localField: '_id',
                 foreignField: '_id',
                 as: 'courseInfo'
               }
            },
            { $unwind: '$courseInfo' },
            { $project: { _id: '$courseInfo.title', enrollments: 1, revenue: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCourses: courses.length,
                totalStudents: uniqueStudents.length,
                totalRevenue: revenue[0]?.total || 0,
                averageQuizScore: quizStats[0]?.avgScore || 0,
                totalQuizAttempts: quizStats[0]?.totalAttempts || 0,
                monthlyRevenue,
                courseBreakdown: courseStats
            }
        });
    } catch (err) {
        console.error('getInstructorAnalytics Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};



// @desc    Get enrolled students for an instructor's courses
// @route   GET /api/v1/analytics/students
// @access  Private (Instructor/Admin)
exports.getEnrolledStudents = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email avatar')
            .populate('course', 'title');

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get detailed analytics for a specific course
// @route   GET /api/v1/analytics/course/:id
// @access  Private (Admin/Instructor)
exports.getCourseAnalytics = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Authorization check: Only Admin or the course Instructor can view analytics
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && course.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to view analytics for this course' });
        }

        // 1. Enrollment and Revenue Stats
        const enrollments = await Enrollment.find({ course: req.params.id });
        const totalEnrolled = enrollments.length;
        const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);

        // 2. Completion Rate Calculation
        // Need to find total lessons in this course's modules
        const Module = require('../models/Module');
        const courseModules = await Module.find({ course: req.params.id }).populate('lessons');
        let totalLessons = 0;
        courseModules.forEach(m => totalLessons += m.lessons.length);

        const completionStats = await Progress.aggregate([
            { $match: { course: course._id, isCompleted: true } },
            { $group: { _id: '$student', completedCount: { $sum: 1 } } }
        ]);

        const studentsCompletedAll = completionStats.filter(s => s.completedCount >= totalLessons).length;
        const avgCompletion = totalEnrolled > 0 ? (completionStats.length / totalEnrolled) * 100 : 0;

        // 3. Quiz Performance
        const Quiz = require('../models/Quiz');
        const courseQuizzes = await Quiz.find({ course: course._id }).select('_id');
        const quizIds = courseQuizzes.map(q => q._id);
        const quizResults = await Result.find({ quiz: { $in: quizIds } });
        
        const quizStats = {
            avgScore: quizResults.length ? (quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length).toFixed(1) : 0,
            passRate: quizResults.length ? ((quizResults.filter(r => r.passed).length / quizResults.length) * 100).toFixed(1) : 0
        };

        // 4. Rating Breakdown
        const Review = require('../models/Review');
        const reviews = await Review.find({ course: course._id });
        const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : course.averageRating;

        res.status(200).json({
            success: true,
            data: {
                totalEnrolled,
                totalRevenue,
                completion: {
                    avgCompletion: avgCompletion.toFixed(1),
                    completedAll: studentsCompletedAll,
                    totalLessons
                },
                quizzes: quizStats,
                reviews: {
                    count: reviews.length,
                    averageRating: avgRating
                }
            }
        });
    } catch (err) {
        console.error('getCourseAnalytics Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};
