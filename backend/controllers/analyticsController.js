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
