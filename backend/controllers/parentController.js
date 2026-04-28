const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Result = require('../models/Result');
const LiveClass = require('../models/LiveClass');

// @desc    Get all linked students for a parent
// @route   GET /api/v1/parent/students
// @access  Private (Parent)
exports.getLinkedStudents = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id).populate('linkedStudents', 'name email role phone dob');
        
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }

        res.status(200).json({
            success: true,
            data: parent.linkedStudents
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get detailed progress for a specific linked student
// @route   GET /api/v1/parent/students/:studentId/progress
// @access  Private (Parent)
exports.getStudentProgress = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id);
        const studentId = req.params.studentId;

        // Security check: Is this student linked to the parent?
        if (!parent.linkedStudents.includes(studentId)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view this student\'s progress' });
        }

        // 1. Get Enrollments
        const enrollments = await Enrollment.find({ student: studentId }).populate('course', 'title thumbnail price');

        // 2. Get Progress for each course
        const progress = await Progress.find({ student: studentId });

        // 3. Get Results (Quiz)
        const results = await Result.find({ student: studentId }).populate('quiz', 'title');

        // 4. Get Attendance (Live Classes)
        // Note: This assumes a field like 'attendedBy' in LiveClass or a separate Attendance model
        // For now, let's simulate with a query to LiveClass if it has participants
        const liveClasses = await LiveClass.find({ 'participants.user': studentId });

        res.status(200).json({
            success: true,
            data: {
                enrollments,
                progress,
                results,
                attendance: liveClasses
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Link a student using a student code
// @route   POST /api/v1/parent/link
// @access  Private (Parent)
exports.linkStudentByCode = async (req, res, next) => {
    try {
        const { studentEmail, studentCode } = req.body;
        
        let query = {};
        if (studentEmail) query.email = studentEmail;
        if (studentCode) query.studentCode = studentCode;

        const student = await User.findOne(query);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Only student accounts can be linked' });
        }

        const parent = await User.findById(req.user.id);
        
        if (parent.linkedStudents.includes(student._id)) {
            return res.status(400).json({ success: false, message: 'Student already linked' });
        }

        parent.linkedStudents.push(student._id);
        await parent.save();

        student.linkedParent = parent._id;
        await student.save();

        res.status(200).json({ success: true, message: 'Student linked successfully', data: student });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
