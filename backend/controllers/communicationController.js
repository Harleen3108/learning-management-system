const QnA = require('../models/QnA');
const Message = require('../models/Message');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { notifyUser } = require('../services/notify');

// Build a deterministic conversationId for a (peer1, peer2) pair, optionally
// scoped to a course. Course threads keep the legacy [course,a,b].sort().join('-')
// format so existing data still loads. Direct threads use a 'direct-' prefix.
function buildConversationId({ courseId, userA, userB }) {
    if (courseId) {
        return [String(courseId), String(userA), String(userB)].sort().join('-');
    }
    return 'direct-' + [String(userA), String(userB)].sort().join('-');
}

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

// @desc    Send message (instructor → student, course-scoped or direct reply)
// @route   POST /api/v1/communication/messages
// @access  Private/Instructor
exports.sendMessage = async (req, res, next) => {
    try {
        const { courseId, recipientId, text } = req.body;
        if (!recipientId || !text?.trim()) {
            return res.status(400).json({ success: false, message: 'Recipient and text are required' });
        }

        // For course-scoped sends, keep the existing enrollment check.
        // Direct replies (no courseId) skip the check — they're follow-ups to a thread
        // the student themselves opened, so enrollment isn't required.
        if (courseId) {
            const enrollment = await Enrollment.findOne({ course: courseId, student: recipientId });
            if (!enrollment) return res.status(400).json({ success: false, message: 'Student not enrolled in this course' });
        }

        const conversationId = buildConversationId({ courseId, userA: recipientId, userB: req.user.id });

        const message = await Message.create({
            conversationId,
            course: courseId || undefined,
            kind: courseId ? 'course' : 'direct',
            sender: req.user.id,
            recipient: recipientId,
            text: text.trim()
        });

        // Drop a notification into the recipient's bell so they see the new message.
        try {
            const sender = await User.findById(req.user.id).select('name');
            const link = courseId
                ? `/dashboard/student/courses/${courseId}` // course-scoped — open the course thread
                : `/dashboard/notifications`;             // direct — student can find it via notifications
            await notifyUser({
                recipient: recipientId,
                type: 'new_message',
                title: `New message from ${sender?.name || 'your instructor'}`,
                message: text.length > 140 ? text.slice(0, 140) + '…' : text,
                link,
                entity: { type: 'message', id: message._id }
            });
        } catch (e) { /* best-effort notification; don't fail the send */ }

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    List all threads for the logged-in instructor (course-scoped + direct)
// @route   GET /api/v1/communication/threads
// @access  Private/Instructor
// Returns one entry per conversation peer, with last-message preview + unread count.
exports.listThreads = async (req, res) => {
    try {
        const me = req.user.id;
        // Pull every message that involves me, then collapse to one row per peer.
        const messages = await Message.find({ $or: [{ sender: me }, { recipient: me }] })
            .populate('sender', 'name email profilePhoto')
            .populate('recipient', 'name email profilePhoto')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const byPeer = new Map();
        for (const m of messages) {
            const peerId = String(m.sender?._id) === String(me) ? String(m.recipient?._id) : String(m.sender?._id);
            if (!peerId) continue;
            // Group key: peer + course (course-scoped threads stay distinct from direct ones)
            const key = `${peerId}__${m.course?._id || 'direct'}`;
            if (byPeer.has(key)) continue; // already have most recent for this thread
            const peer = String(m.sender?._id) === String(me) ? m.recipient : m.sender;
            byPeer.set(key, {
                conversationId: m.conversationId,
                kind: m.kind || (m.course ? 'course' : 'direct'),
                course: m.course || null,
                peer: peer ? { _id: peer._id, name: peer.name, email: peer.email, profilePhoto: peer.profilePhoto } : null,
                lastMessage: { text: m.text, createdAt: m.createdAt, fromMe: String(m.sender?._id) === String(me) }
            });
        }

        // Compute unread count per thread (messages addressed to me, isRead false)
        const threads = await Promise.all(Array.from(byPeer.values()).map(async (t) => {
            const unread = await Message.countDocuments({ conversationId: t.conversationId, recipient: me, isRead: false });
            return { ...t, unread };
        }));

        // Sort by last message timestamp desc
        threads.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

        res.status(200).json({ success: true, data: threads });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark all messages in a conversation as read (for the current user)
// @route   POST /api/v1/communication/threads/:conversationId/read
// @access  Private/Instructor (or Student via student route — see below)
exports.markThreadRead = async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true });
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
