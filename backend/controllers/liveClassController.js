const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const AuditLog = require('../models/AuditLog');

// @desc    Schedule a live class
// @route   POST /api/v1/live-classes
// @access  Private (Instructor/Admin)
exports.scheduleLiveClass = async (req, res, next) => {
    try {
        req.body.instructor = req.user.id;

        const course = await Course.findById(req.body.course);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Verify ownership
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to schedule live class for this course' });
        }

        const liveClass = await LiveClass.create(req.body);

        // Audit Log
        await AuditLog.create({
            user: req.user.id,
            action: 'SCHEDULE_LIVE_CLASS',
            resource: 'LiveClass',
            details: `Scheduled live class: ${liveClass.title} for course: ${course.title}`,
            entityId: liveClass._id
        });

        res.status(201).json({ success: true, data: liveClass });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get live classes for a course
// @route   GET /api/v1/live-classes/course/:courseId
// @access  Public
exports.getLiveClasses = async (req, res, next) => {
    try {
        const liveClasses = await LiveClass.find({ course: req.params.courseId }).sort('scheduledAt');
        res.status(200).json({ success: true, count: liveClasses.length, data: liveClasses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all live classes for the current instructor
// @route   GET /api/v1/live-classes/me
// @access  Private (Instructor/Admin)
exports.getMyLiveClasses = async (req, res, next) => {
    try {
        const liveClasses = await LiveClass.find({ instructor: req.user.id })
            .populate('course', 'title thumbnail')
            .sort('scheduledAt');

        res.status(200).json({
            success: true,
            count: liveClasses.length,
            data: liveClasses
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a live class
// @route   PUT /api/v1/live-classes/:id
// @access  Private (Instructor/Admin)
exports.updateLiveClass = async (req, res, next) => {
    try {
        let liveClass = await LiveClass.findById(req.params.id);

        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }

        // Verify ownership
        if (liveClass.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this live class' });
        }

        liveClass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Audit Log
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_LIVE_CLASS',
            resource: 'LiveClass',
            details: `Updated live class: ${liveClass.title}`,
            entityId: liveClass._id
        });

        res.status(200).json({ success: true, data: liveClass });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a live class
// @route   DELETE /api/v1/live-classes/:id
// @access  Private (Instructor/Admin)
exports.deleteLiveClass = async (req, res, next) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);

        if (!liveClass) {
            return res.status(404).json({ success: false, message: 'Live class not found' });
        }

        // Verify ownership
        if (liveClass.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this live class' });
        }

        await liveClass.deleteOne();

        // Audit Log
        await AuditLog.create({
            user: req.user.id,
            action: 'DELETE_LIVE_CLASS',
            resource: 'LiveClass',
            details: `Deleted live class: ${liveClass.title}`,
            entityId: liveClass._id
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

