const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');

// @desc    Get instructor public profile
// @route   GET /api/v1/instructors/:id/profile
// @access  Public
exports.getInstructorProfile = async (req, res, next) => {
    try {
        const instructor = await User.findById(req.params.id)
            .select('name instructorBio instructorSpecialty profilePhoto socialLinks phone createdAt role');

        if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }

        // 1. Get all courses by this instructor
        const courses = await Course.find({ instructor: instructor._id, status: 'published' })
            .select('title thumbnail price category averageRating');

        // 2. Get total unique students
        const uniqueStudents = await Enrollment.distinct('student', { course: { $in: courses.map(c => c._id) } });

        // 3. Get total ratings & reviews
        const reviews = await Review.find({ course: { $in: courses.map(c => c._id) } });
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                profile: instructor,
                stats: {
                    totalStudents: uniqueStudents.length,
                    totalCourses: courses.length,
                    totalReviews: reviews.length,
                    averageRating: avgRating
                },
                courses
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update instructor profile
// @route   PUT /api/v1/instructors/profile
// @access  Private (Instructor)
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            instructorBio: req.body.instructorBio,
            instructorSpecialty: req.body.instructorSpecialty,
            profilePhoto: req.body.profilePhoto,
            socialLinks: req.body.socialLinks,
            phone: req.body.phone
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

        const instructor = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        }).select('name instructorBio instructorSpecialty profilePhoto socialLinks phone');

        res.status(200).json({
            success: true,
            data: instructor
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
