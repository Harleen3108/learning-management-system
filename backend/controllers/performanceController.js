const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Result = require('../models/Result');
const Progress = require('../models/Progress');
const Review = require('../models/Review');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// @desc    Get Performance Overview
// @route   GET /api/v1/performance/overview
// @access  Private/Instructor
exports.getOverview = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.status(200).json({ success: true, data: { totalCourses: 0, totalStudents: 0, activeStudents: 0, totalRevenue: 0, avgRating: 0, completionRate: 0, watchTime: 0 } });
        }

        // Total Students (Unique)
        const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });

        // Total Revenue
        const revenue = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Average Rating
        const avgRating = await Review.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        // Completion Rate
        // This is complex, but let's approximate by lessons completed vs total lessons
        const progressCount = await Progress.countDocuments({ course: { $in: courseIds }, isCompleted: true });
        // Total lessons across all courses
        const Module = require('../models/Module');
        const modules = await Module.find({ course: { $in: courseIds } }).populate('lessons');
        let totalLessonsAcrossCourses = 0;
        modules.forEach(m => totalLessonsAcrossCourses += m.lessons.length);

        const completionRate = totalLessonsAcrossCourses > 0 ? (progressCount / (totalStudents.length * totalLessonsAcrossCourses)) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalCourses: courses.length,
                totalStudents: totalStudents.length,
                activeStudents: totalStudents.length, // Simplified for now
                totalRevenue: revenue[0]?.total || 0,
                avgRating: avgRating[0]?.avg || 0,
                completionRate: completionRate.toFixed(1),
                watchTime: 0 // Need video tracking for this
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Revenue Detailed Analytics
// @route   GET /api/v1/performance/revenue
// @access  Private/Instructor
exports.getRevenueAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        // Monthly trends
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, enrolledAt: { $gte: sixMonthsAgo } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m", date: "$enrolledAt" } }, 
                    revenue: { $sum: "$amount" }
                } 
            },
            { $sort: { "_id": 1 } }
        ]);

        // Revenue per course
        const revenuePerCourse = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: '$course', totalRevenue: { $sum: '$amount' }, enrollments: { $sum: 1 } } },
            { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } },
            { $unwind: '$courseInfo' },
            { $project: { title: '$courseInfo.title', totalRevenue: 1, enrollments: 1 } },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue,
                revenuePerCourse
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Students Performance
// @route   GET /api/v1/performance/students
// @access  Private/Instructor
exports.getStudentsAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        // All student enrollments for these courses
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email profilePhoto')
            .populate('course', 'title');

        // Student progress calculation
        // This would involve aggregating progress per student/course
        const studentStats = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            {
                $lookup: {
                    from: 'progresses',
                    let: { studentId: '$student', courseId: '$course' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$student', '$$studentId'] }, { $eq: ['$course', '$$courseId'] }, { $eq: ['$isCompleted', true] }] } } }
                    ],
                    as: 'completedLessons'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            {
                $project: {
                    student: { name: '$studentInfo.name', email: '$studentInfo.email', profilePhoto: '$studentInfo.profilePhoto' },
                    course: { title: '$courseInfo.title' },
                    completedCount: { $size: '$completedLessons' },
                    enrolledAt: 1
                }
            }
        ]);

        res.status(200).json({ success: true, data: studentStats });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Review Analytics
// @route   GET /api/v1/performance/reviews
// @access  Private/Instructor
exports.getReviewsAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        const reviews = await Review.find({ course: { $in: courseIds } })
            .populate('student', 'name profilePhoto')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const ratingDistribution = await Review.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                ratingDistribution
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Engagement Analytics (Course + Quiz)
// @route   GET /api/v1/performance/engagement
// @access  Private/Instructor
exports.getEngagementAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;
        const courses = await Course.find({ instructor: instructorId });
        const courseIds = courses.map(c => c._id);

        // 1. Course Engagement (Most watched/completed lessons)
        const lessonEngagement = await Progress.aggregate([
            { $match: { course: { $in: courseIds }, isCompleted: true } },
            { $group: { _id: '$lesson', completionCount: { $sum: 1 } } },
            { $lookup: { from: 'lessons', localField: '_id', foreignField: '_id', as: 'lessonInfo' } },
            { $unwind: '$lessonInfo' },
            { $project: { title: '$lessonInfo.title', completionCount: 1 } },
            { $sort: { completionCount: -1 } },
            { $limit: 10 }
        ]);

        // 2. Practice Test Insights
        const quizzes = await Quiz.find({ course: { $in: courseIds } });
        const quizIds = quizzes.map(q => q._id);

        const quizPerformance = await Result.aggregate([
            { $match: { quiz: { $in: quizIds } } },
            {
                $group: {
                    _id: '$quiz',
                    avgScore: { $avg: '$score' },
                    attempts: { $sum: 1 },
                    passCount: { $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] } } // Assuming 70 is pass
                }
            },
            { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'quizInfo' } },
            { $unwind: '$quizInfo' },
            { $project: { title: '$quizInfo.title', avgScore: 1, attempts: 1, passCount: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                lessonEngagement,
                quizPerformance
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
