const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');

// @desc    Check if user is enrolled in the course or is the instructor/admin
exports.checkEnrollment = async (req, res, next) => {
    try {
        let courseId = req.params.courseId || req.params.id;
        let lessonId = req.params.lessonId || req.params.id;

        // If it's a lesson route (nested under modules, or standalone)
        // We might need to find the course from the lesson/module
        if (req.originalUrl.includes('/lessons')) {
            const Lesson = require('../models/Lesson');
            const lesson = await Lesson.findById(lessonId).populate({
                path: 'module',
                populate: { path: 'course' }
            });
            if (lesson) {
                courseId = lesson.module.course._id;
            }
        } else if (req.originalUrl.includes('/modules')) {
            const module = await Module.findById(req.params.moduleId || req.params.id);
            if (module) {
                courseId = module.course;
            }
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // 1. Allow Admin/Super-Admin
        if (req.user.role === 'admin' || req.user.role === 'super-admin') {
            return next();
        }

        // 2. Allow Instructor of the course
        if (course.instructor.toString() === req.user.id) {
            return next();
        }

        // 3. Check Enrollment for Students
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId,
            status: 'completed'
        });

        if (!enrollment) {
            return res.status(403).json({ 
                success: false, 
                message: 'No active enrollment found. Please enroll to access this content.',
                isEnrolled: false
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error in Enrollment Check' });
    }
};
