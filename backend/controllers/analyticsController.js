const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Progress = require('../models/Progress');

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
