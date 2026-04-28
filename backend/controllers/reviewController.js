const Review = require('../models/Review');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');

// @desc    Get all reviews with filtering
// @route   GET /api/v1/reviews
// @access  Private (Admin)
exports.getReviews = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};
        
        if (status) query.status = status;
        else query.status = { $ne: 'deleted' }; // Default to not showing deleted

        const reviews = await Review.find(query)
            .populate('student', 'name email')
            .populate('course', 'title image')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Moderate Review (Update status/flag)
// @route   PUT /api/v1/reviews/:id/moderate
// @access  Private (Admin)
exports.moderateReview = async (req, res, next) => {
    try {
        const { status } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.status = status;
        await review.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'MODERATE_REVIEW',
            resource: 'Review',
            details: `Updated review ${review._id} status to ${status}`,
            entityId: review._id
        });

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get reviews for a single course
// @route   GET /api/v1/courses/:courseId/reviews
// @access  Public
exports.getCourseReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ course: req.params.courseId, status: 'active' }).populate('student', 'name');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add review
// @route   POST /api/v1/courses/:courseId/reviews
// @access  Private (Student)
exports.addReview = async (req, res, next) => {
    try {
        // The route can pass course via URL params or body — handle both shapes.
        const courseId = req.params.courseId || req.body.course;
        req.body.course = courseId;
        req.body.student = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const review = await Review.create(req.body);

        // Notify the course's instructor
        try {
            const { notifyUser } = require('../services/notify');
            const User = require('../models/User');
            const reviewer = await User.findById(req.user.id).select('name');
            if (course.instructor) {
                await notifyUser({
                    recipient: course.instructor,
                    type: 'new_review',
                    title: `New ${req.body.rating || 5}★ review`,
                    message: `${reviewer?.name || 'A student'} reviewed "${course.title}".`,
                    link: '/dashboard/instructor/performance?section=reviews',
                    entity: { type: 'Course', id: course._id }
                });
            }
        } catch (e) { console.error('[notify] new review:', e.message); }

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Admin/Owner)
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure user is admin or review owner
        if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get reviews for instructor's courses
// @route   GET /api/v1/reviews/instructor/me
// @access  Private (Instructor/Admin)
exports.getInstructorReviews = async (req, res, next) => {
    try {
        // 1. Get instructor courses
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        // 2. Get reviews for these courses
        const reviews = await Review.find({ 
            course: { $in: courseIds },
            status: { $ne: 'deleted' }
        })
        .populate('student', 'name email avatar')
        .populate('course', 'title image')
        .sort('-createdAt');

        // Calculate stats
        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : 0,
            sentimentDistribution: {
                Positive: reviews.filter(r => r.sentimentLabel === 'Positive').length,
                Constructive: reviews.filter(r => r.sentimentLabel === 'Constructive').length,
                Neutral: reviews.filter(r => r.sentimentLabel === 'Neutral').length,
            }
        };

        res.status(200).json({ 
            success: true, 
            count: reviews.length, 
            stats,
            data: reviews 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

