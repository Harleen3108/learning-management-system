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

// @desc    Update Lesson Progress
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
            if (isCompleted !== undefined) progress.isCompleted = isCompleted;
            progress.updatedAt = Date.now();
            await progress.save();
        } else {
            progress = await Progress.create({
                student: userId,
                lesson: lessonId,
                course: courseId,
                lastWatchedTime: lastWatchedTime || 0,
                isCompleted: isCompleted || false
            });
        }

        res.status(200).json({ success: true, data: progress });
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
