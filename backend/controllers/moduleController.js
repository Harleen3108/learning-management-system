const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Add module to course
// @route   POST /api/v1/courses/:courseId/modules
// @access  Private (Instructor/Admin)
exports.addModule = async (req, res, next) => {
    try {
        req.body.course = req.params.courseId;

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Make sure user is course instructor
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to add module to this course' });
        }

        const module = await Module.create(req.body);

        res.status(201).json({ success: true, data: module });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get modules for course
// @route   GET /api/v1/courses/:courseId/modules
// @access  Public
exports.getModules = async (req, res, next) => {
    try {
        const modules = await Module.find({ course: req.params.courseId }).populate('lessons');
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update module
// @route   PUT /api/v1/courses/:courseId/modules/:id
// @access  Private (Instructor/Admin)
exports.updateModule = async (req, res, next) => {
    try {
        let module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const course = await Course.findById(module.course);

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this module' });
        }

        module = await Module.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: module });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete module
// @route   DELETE /api/v1/courses/:courseId/modules/:id
// @access  Private (Instructor/Admin)
exports.deleteModule = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const course = await Course.findById(module.course);

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this module' });
        }

        await module.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
