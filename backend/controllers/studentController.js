const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const LiveClass = require('../models/LiveClass');
const Note = require('../models/Note');
const Result = require('../models/Result');
const Bookmark = require('../models/Bookmark');
const AuditLog = require('../models/AuditLog');

// @desc    Get Student Dashboard Data
// @route   GET /api/v1/student/dashboard
// @access  Private (Student)
exports.getStudentDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. Get Enrolled Courses
        const enrollments = await Enrollment.find({ student: userId, status: 'completed' })
            .populate({
                path: 'course',
                populate: { path: 'modules', populate: { path: 'lessons', select: '_id' } }
            });

        // 2. Calculate Progress for each course
        const coursesWithProgress = await Promise.all(enrollments.map(async (enr) => {
            const course = enr.course;
            if (!course) return null;

            // Total lessons in course
            let totalLessons = 0;
            course.modules.forEach(m => totalLessons += (m.lessons ? m.lessons.length : 0));

            // Completed lessons
            const completedCount = await Progress.countDocuments({
                student: userId,
                course: course._id,
                isCompleted: true
            });

            // Find last activity for this course
            const lastActivity = await Progress.findOne({
                student: userId,
                course: course._id
            }).sort('-updatedAt').populate('lesson', 'title');

            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                category: course.category,
                progress: {
                    completed: completedCount,
                    total: totalLessons,
                    percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
                },
                lastLesson: lastActivity ? {
                    id: lastActivity.lesson._id,
                    title: lastActivity.lesson.title,
                    updatedAt: lastActivity.updatedAt
                } : null
            };
        }));

        const activeCourses = coursesWithProgress.filter(c => c !== null);

        // 3. Upcoming Live Classes
        const courseIds = activeCourses.map(c => c._id);
        const upcomingLive = await LiveClass.find({
            course: { $in: courseIds },
            scheduledAt: { $gte: new Date() }
        }).sort('scheduledAt').limit(5);

        // 4. Recent Activity (Audit Logs for this user)
        const recentActivity = await AuditLog.find({ user: userId })
            .sort('-createdAt')
            .limit(10);

        // 5. Stats (Total completed courses, hours spent - estimate)
        const stats = {
            enrolledCount: activeCourses.length,
            completedCourses: activeCourses.filter(c => c.progress.percentage === 100).length,
            totalLessonsCompleted: activeCourses.reduce((acc, c) => acc + c.progress.completed, 0)
        };

        res.status(200).json({
            success: true,
            data: {
                enrolledCourses: activeCourses,
                upcomingLive,
                recentActivity,
                stats
            }
        });
    } catch (err) {
        console.error('getStudentDashboard Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update Lesson Progress (legacy + video watch position)
// @route   POST /api/v1/student/progress
// @access  Private (Student)
exports.updateProgress = async (req, res, next) => {
    try {
        const { courseId, lessonId, lastWatchedTime, isCompleted } = req.body;
        const userId = req.user.id;

        let progress = await Progress.findOne({
            student: userId,
            lesson: lessonId,
            course: courseId
        });

        if (progress) {
            if (lastWatchedTime !== undefined) progress.lastWatchedTime = lastWatchedTime;
            if (isCompleted !== undefined) {
                progress.isCompleted = isCompleted;
                if (isCompleted && !progress.completedAt) progress.completedAt = new Date();
            }
            progress.updatedAt = Date.now();
            await progress.save();
        } else {
            progress = await Progress.create({
                student: userId,
                lesson: lessonId,
                course: courseId,
                lastWatchedTime: lastWatchedTime || 0,
                isCompleted: isCompleted || false,
                completedAt: isCompleted ? new Date() : undefined
            });
        }

        res.status(200).json({ success: true, data: progress });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark a reading lesson as complete
// @route   POST /api/v1/student/progress/:lessonId/mark-read
// @access  Private (Student)
exports.markAsRead = async (req, res) => {
    try {
        const Lesson = require('../models/Lesson');
        const Module = require('../models/Module');
        const userId = req.user.id;
        const lessonId = req.params.lessonId;

        const lesson = await Lesson.findById(lessonId).populate('module');
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
        if (lesson.type !== 'reading') {
            return res.status(400).json({ success: false, message: 'This lesson is not a reading' });
        }

        const courseId = lesson.module?.course;
        let progress = await Progress.findOne({ student: userId, lesson: lessonId });
        if (progress) {
            progress.markedAsRead = true;
            progress.isCompleted = true;
            progress.completedAt = progress.completedAt || new Date();
            progress.updatedAt = new Date();
            await progress.save();
        } else {
            progress = await Progress.create({
                student: userId,
                lesson: lessonId,
                course: courseId,
                markedAsRead: true,
                isCompleted: true,
                completedAt: new Date()
            });
        }
        res.status(200).json({ success: true, data: progress });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Submit an assignment attempt
// @route   POST /api/v1/student/progress/:lessonId/submit-assignment
// @access  Private (Student)
// Body: { answers: [{ questionId, selectedOptionIndex }] }
exports.submitAssignment = async (req, res) => {
    try {
        const Lesson = require('../models/Lesson');
        const userId = req.user.id;
        const lessonId = req.params.lessonId;
        const { answers = [] } = req.body;

        const lesson = await Lesson.findById(lessonId).populate('module');
        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
        if (lesson.type !== 'assignment' || !lesson.assignment) {
            return res.status(400).json({ success: false, message: 'This lesson has no assignment' });
        }

        const courseId = lesson.module?.course;
        const { questions = [], maxAttempts = 5, passingScore = 50 } = lesson.assignment;

        let progress = await Progress.findOne({ student: userId, lesson: lessonId });
        if (!progress) {
            progress = await Progress.create({
                student: userId,
                lesson: lessonId,
                course: courseId,
                attempts: []
            });
        }

        if (progress.attempts.length >= maxAttempts) {
            return res.status(400).json({
                success: false,
                message: `You have already used all ${maxAttempts} attempts.`,
                bestScore: progress.bestScore
            });
        }

        // Score the attempt
        let score = 0;
        let totalMarks = 0;
        let correctCount = 0;
        const detailedAnswers = [];

        for (const q of questions) {
            totalMarks += q.marks || 1;
            const submitted = answers.find(a => String(a.questionId) === String(q._id));
            const correctIndex = q.options.findIndex(o => o.isCorrect);
            const selectedIndex = submitted ? Number(submitted.selectedOptionIndex) : -1;
            const isCorrect = selectedIndex >= 0 && selectedIndex === correctIndex;
            if (isCorrect) {
                score += q.marks || 1;
                correctCount += 1;
            }
            detailedAnswers.push({
                questionId: q._id,
                selectedOptionIndex: selectedIndex,
                isCorrect
            });
        }

        const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
        const passed = percentage >= passingScore;

        const attempt = {
            score,
            totalMarks,
            percentage,
            correctCount,
            totalQuestions: questions.length,
            answers: detailedAnswers,
            passed,
            attemptedAt: new Date()
        };

        progress.attempts.push(attempt);

        if (percentage >= progress.bestScore) {
            progress.bestScore = percentage;
            progress.bestAttemptAt = attempt.attemptedAt;
        }
        // An assignment lesson is "completed" once the student passes OR uses all attempts.
        if (passed || progress.attempts.length >= maxAttempts) {
            if (!progress.isCompleted) {
                progress.isCompleted = true;
                progress.completedAt = new Date();
            }
        }
        progress.updatedAt = new Date();
        await progress.save();

        const attemptsRemaining = Math.max(0, maxAttempts - progress.attempts.length);

        res.status(200).json({
            success: true,
            data: {
                attempt,
                bestScore: progress.bestScore,
                attemptsUsed: progress.attempts.length,
                attemptsRemaining,
                isCompleted: progress.isCompleted,
                passed,
                passingScore,
                // Reveal correct answer indices so the student sees which they got right/wrong
                review: questions.map(q => ({
                    questionId: q._id,
                    correctOptionIndex: q.options.findIndex(o => o.isCorrect),
                    explanation: q.explanation
                }))
            }
        });
    } catch (err) {
        console.error('submitAssignment error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get progress for a single lesson (attempt history etc.)
// @route   GET /api/v1/student/progress/lesson/:lessonId
// @access  Private (Student)
exports.getLessonProgress = async (req, res) => {
    try {
        const progress = await Progress.findOne({
            student: req.user.id,
            lesson: req.params.lessonId
        });
        res.status(200).json({ success: true, data: progress });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────
// Direct messaging — student initiates a conversation with an instructor
// (e.g. from the public instructor profile page).
// ─────────────────────────────────────────────────────────

// @desc    Send a direct message to an instructor (no course required)
// @route   POST /api/v1/student/messages
// @access  Private (Student)
// Body: { recipientId, text, courseId? }
exports.sendDirectMessage = async (req, res) => {
    try {
        const Message = require('../models/Message');
        const User = require('../models/User');
        const { notifyUser } = require('../services/notify');

        const { recipientId, text, courseId } = req.body;
        if (!recipientId || !text?.trim()) {
            return res.status(400).json({ success: false, message: 'Recipient and message text are required' });
        }
        if (String(recipientId) === String(req.user.id)) {
            return res.status(400).json({ success: false, message: "You can't message yourself" });
        }

        // Verify recipient exists and is an instructor (so students can't spam each other via this route)
        const recipient = await User.findById(recipientId).select('name role');
        if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found' });
        if (!['instructor', 'admin', 'super-admin'].includes(recipient.role)) {
            return res.status(400).json({ success: false, message: 'You can only message instructors here' });
        }

        const conversationId = courseId
            ? [String(courseId), String(recipientId), String(req.user.id)].sort().join('-')
            : 'direct-' + [String(recipientId), String(req.user.id)].sort().join('-');

        const message = await Message.create({
            conversationId,
            course: courseId || undefined,
            kind: courseId ? 'course' : 'direct',
            sender: req.user.id,
            recipient: recipientId,
            text: text.trim()
        });

        // Drop a notification into the instructor's bell
        try {
            const sender = await User.findById(req.user.id).select('name');
            await notifyUser({
                recipient: recipientId,
                type: 'new_message',
                title: `New message from ${sender?.name || 'a student'}`,
                message: text.length > 140 ? text.slice(0, 140) + '…' : text,
                link: '/dashboard/instructor/communication?section=messages',
                entity: { type: 'message', id: message._id }
            });
        } catch (e) { /* best-effort */ }

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        console.error('sendDirectMessage error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    List all my message threads (collapsed by peer)
// @route   GET /api/v1/student/messages/threads
// @access  Private (Student)
exports.listMyThreads = async (req, res) => {
    try {
        const Message = require('../models/Message');
        const me = req.user.id;
        const messages = await Message.find({ $or: [{ sender: me }, { recipient: me }] })
            .populate('sender', 'name email profilePhoto')
            .populate('recipient', 'name email profilePhoto')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const byPeer = new Map();
        for (const m of messages) {
            const peerId = String(m.sender?._id) === String(me) ? String(m.recipient?._id) : String(m.sender?._id);
            if (!peerId) continue;
            const key = `${peerId}__${m.course?._id || 'direct'}`;
            if (byPeer.has(key)) continue;
            const peer = String(m.sender?._id) === String(me) ? m.recipient : m.sender;
            byPeer.set(key, {
                conversationId: m.conversationId,
                kind: m.kind || (m.course ? 'course' : 'direct'),
                course: m.course || null,
                peer: peer ? { _id: peer._id, name: peer.name, email: peer.email, profilePhoto: peer.profilePhoto } : null,
                lastMessage: { text: m.text, createdAt: m.createdAt, fromMe: String(m.sender?._id) === String(me) }
            });
        }

        const threads = await Promise.all(Array.from(byPeer.values()).map(async (t) => {
            const unread = await Message.countDocuments({ conversationId: t.conversationId, recipient: me, isRead: false });
            return { ...t, unread };
        }));
        threads.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

        res.status(200).json({ success: true, data: threads });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all messages in a conversation (for the student who is part of it)
// @route   GET /api/v1/student/messages/:conversationId
// @access  Private (Student)
exports.getThreadMessages = async (req, res) => {
    try {
        const Message = require('../models/Message');
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('sender', 'name profilePhoto')
            .sort({ createdAt: 1 });

        // Only allow the student to read their own threads
        const involves = messages.some(m =>
            String(m.sender?._id) === String(req.user.id) ||
            String(m.recipient) === String(req.user.id)
        );
        if (messages.length > 0 && !involves) {
            return res.status(403).json({ success: false, message: 'Not authorized for this conversation' });
        }

        // Mark messages addressed to me as read
        await Message.updateMany(
            { conversationId: req.params.conversationId, recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Course Progress
// @route   GET /api/v1/student/progress/:courseId
// @access  Private (Student)
exports.getCourseProgress = async (req, res, next) => {
    try {
        const progress = await Progress.find({
            student: req.user.id,
            course: req.params.courseId
        });

        res.status(200).json({ success: true, data: progress });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add Study Note
// @route   POST /api/v1/student/notes
// @access  Private (Student)
exports.addNote = async (req, res, next) => {
    try {
        const { courseId, lessonId, content, timestamp } = req.body;
        
        const note = await Note.create({
            student: req.user.id,
            course: courseId,
            lesson: lessonId,
            content,
            timestamp
        });

        res.status(201).json({ success: true, data: note });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Notes for a Course
// @route   GET /api/v1/student/notes/:courseId
// @access  Private (Student)
exports.getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find({
            student: req.user.id,
            course: req.params.courseId
        }).populate('lesson', 'title').sort('-createdAt');

        res.status(200).json({ success: true, data: notes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Leaderboard
// @route   GET /api/v1/student/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
    try {
        // Simple Leaderboard: Students with most completed lessons
        const leaderboard = await Progress.aggregate([
            { $match: { isCompleted: true } },
            { $group: { _id: '$student', completedCount: { $sum: 1 } } },
            { $sort: { completedCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    completedCount: 1,
                    name: '$user.name',
                    avatar: '$user.avatar'
                }
            }
        ]);

        res.status(200).json({ success: true, data: leaderboard });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Toggle Bookmark for a Lesson
// @route   POST /api/v1/student/bookmarks
// @access  Private (Student)
exports.toggleBookmark = async (req, res, next) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.id;

        const existing = await Bookmark.findOne({ student: userId, lesson: lessonId });

        if (existing) {
            await Bookmark.deleteOne({ _id: existing._id });
            return res.status(200).json({ success: true, message: 'Bookmark removed', isBookmarked: false });
        }

        const bookmark = await Bookmark.create({
            student: userId,
            course: courseId,
            lesson: lessonId
        });

        res.status(201).json({ success: true, data: bookmark, isBookmarked: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get All Bookmarks
// @route   GET /api/v1/student/bookmarks
// @access  Private (Student)
exports.getBookmarks = async (req, res, next) => {
    try {
        const bookmarks = await Bookmark.find({ student: req.user.id })
            .populate('course', 'title thumbnail')
            .populate('lesson', 'title duration')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: bookmarks.length, data: bookmarks });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get Enrolled Courses Detailed List
// @route   GET /api/v1/student/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id, status: 'completed' })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            });

        const courses = await Promise.all(enrollments.map(async (enr) => {
            const course = enr.course;
            if (!course) return null;

            const completedCount = await Progress.countDocuments({
                student: req.user.id,
                course: course._id,
                isCompleted: true
            });

            // Count total lessons
            const courseData = await Course.findById(course._id).populate('modules');
            let totalLessons = 0;
            if (courseData.modules) {
                courseData.modules.forEach(m => totalLessons += (m.lessons ? m.lessons.length : 0));
            }

            return {
                ...course.toObject(),
                progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
                completedLessons: completedCount,
                totalLessons
            };
        }));

        res.status(200).json({ success: true, data: courses.filter(c => c !== null) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
