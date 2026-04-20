const Lesson = require('../models/Lesson');
const Module = require('../models/Module');

// @desc    Add lesson to module
// @route   POST /api/v1/modules/:moduleId/lessons
// @access  Private (Instructor/Admin)
exports.addLesson = async (req, res, next) => {
    try {
        req.body.module = req.params.moduleId;

        const module = await Module.findById(req.params.moduleId);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const Course = require('../models/Course');
        const AuditLog = require('../models/AuditLog');
        const course = await Course.findById(module.course);

        // Make sure user is course instructor
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to add lesson to this course' });
        }

        // Add lesson
        const lesson = await Lesson.create(req.body);

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'CREATE_LESSON',
            resource: 'Lesson',
            details: `Added lesson: ${lesson.title} to module: ${module.title}`,
            entityId: lesson._id
        });

        res.status(201).json({ success: true, data: lesson });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get lessons for module
// @route   GET /api/v1/modules/:moduleId/lessons
// @access  Public
exports.getLessons = async (req, res, next) => {
    try {
        const lessons = await Lesson.find({ module: req.params.moduleId });
        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update lesson
// @route   PUT /api/v1/lessons/:id
// @access  Private (Instructor/Admin)
exports.updateLesson = async (req, res, next) => {
    try {
        let lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        const module = await Module.findById(lesson.module);
        const Course = require('../models/Course');
        const course = await Course.findById(module.course);

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this lesson' });
        }

        lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: lesson });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete lesson
// @route   DELETE /api/v1/lessons/:id
// @access  Private (Instructor/Admin)
exports.deleteLesson = async (req, res, next) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        const module = await Module.findById(lesson.module);
        const Course = require('../models/Course');
        const course = await Course.findById(module.course);

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this lesson' });
        }

        await lesson.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
