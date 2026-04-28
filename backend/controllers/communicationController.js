const QnA = require('../models/QnA');
const Message = require('../models/Message');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Get all instructor's courses (Utility for dropdowns)
// @route   GET /api/v1/communication/courses
// @access  Private/Instructor
exports.getInstructorCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id }).select('title _id');
        res.status(200).json({ success: true, data: courses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- Q&A SECTION ---

// @desc    Get all questions for instructor's courses
// @route   GET /api/v1/communication/qna
// @access  Private/Instructor
exports.getInstructorQnA = async (req, res, next) => {
    try {
        const { courseId, status } = req.query;
        let query = { instructor: req.user.id };

        if (courseId) query.course = courseId;
        if (status === 'unanswered') query.isAnswered = false;

        const qnas = await QnA.find(query)
            .populate('course', 'title')
            .populate('student', 'name profilePhoto')
            .populate('lesson', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: qnas });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reply to a question
// @route   POST /api/v1/communication/qna/:id/reply
// @access  Private/Instructor
exports.replyToQuestion = async (req, res, next) => {
    try {
        const qna = await QnA.findById(req.params.id);

        if (!qna) return res.status(404).json({ success: false, message: 'Question not found' });
        if (qna.instructor.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

        qna.replies.push({
            user: req.user.id,
            text: req.body.text
        });
        qna.isAnswered = true;
        await qna.save();

        res.status(200).json({ success: true, data: qna });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- MESSAGES SECTION ---

// @desc    Get enrolled students for instructor's courses
// @route   GET /api/v1/communication/students
// @access  Private/Instructor
exports.getCourseStudents = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ success: false, message: 'Course ID required' });

        const course = await Course.findById(courseId);
        if (!course || course.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email profilePhoto');
        const students = enrollments.map(e => e.student);

        res.status(200).json({ success: true, data: students });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get conversations/messages
// @route   GET /api/v1/communication/messages
// @access  Private/Instructor
exports.getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.query;
        const messages = await Message.find({ conversationId })
            .populate('sender', 'name profilePhoto')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Send message
// @route   POST /api/v1/communication/messages
// @access  Private/Instructor
exports.sendMessage = async (req, res, next) => {
    try {
        const { courseId, recipientId, text } = req.body;
        
        // Ensure student is enrolled in the course
        const enrollment = await Enrollment.findOne({ course: courseId, student: recipientId });
        if (!enrollment) return res.status(400).json({ success: false, message: 'Student not enrolled in this course' });

        const conversationId = [courseId, recipientId, req.user.id].sort().join('-');

        const message = await Message.create({
            conversationId,
            course: courseId,
            sender: req.user.id,
            recipient: recipientId,
            text
        });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- ASSIGNMENTS SECTION ---

// @desc    Create assignment
// @route   POST /api/v1/communication/assignments
// @access  Private/Instructor
exports.createAssignment = async (req, res, next) => {
    try {
        const { courseId, title, description, dueDate, attachments } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course || course.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const assignment = await Assignment.create({
            course: courseId,
            instructor: req.user.id,
            title,
            description,
            dueDate,
            attachments
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update assignment
// @route   PUT /api/v1/communication/assignments/:id
// @access  Private/Instructor
exports.updateAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: assignment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/v1/communication/assignments/:id
// @access  Private/Instructor
exports.deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        if (assignment.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await assignment.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get assignments for instructor's courses
// @route   GET /api/v1/communication/assignments
// @access  Private/Instructor
exports.getAssignments = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        let query = { instructor: req.user.id };
        if (courseId) query.course = courseId;

        const assignments = await Assignment.find(query).populate('course', 'title');
        res.status(200).json({ success: true, data: assignments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/v1/communication/assignments/:id/submissions
// @access  Private/Instructor
exports.getSubmissions = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment || assignment.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
            .populate('student', 'name email');

        res.status(200).json({ success: true, data: submissions });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Grade submission
// @route   PUT /api/v1/communication/submissions/:id/grade
// @access  Private/Instructor
exports.gradeSubmission = async (req, res, next) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await AssignmentSubmission.findById(req.params.id).populate('assignment');

        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
        if (submission.assignment.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        await submission.save();

        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// --- ANNOUNCEMENTS SECTION ---

// @desc    Create announcement
// @route   POST /api/v1/communication/announcements
// @access  Private/Instructor
exports.createAnnouncement = async (req, res, next) => {
    try {
        const { courseId, title, content, isPinned, scheduledFor } = req.body;

        const course = await Course.findById(courseId);
        if (!course || course.instructor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const announcement = await Announcement.create({
            course: courseId,
            instructor: req.user.id,
            title,
            content,
            isPinned,
            scheduledFor
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get announcements
// @route   GET /api/v1/communication/announcements
// @access  Private/Instructor
exports.getAnnouncements = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        let query = { instructor: req.user.id };
        if (courseId) query.course = courseId;

        const announcements = await Announcement.find(query)
            .populate('course', 'title')
            .sort({ scheduledFor: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
