const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../services/cloudinary');

// @desc    Get Cloudinary upload signature
// @route   GET /api/v1/courses/upload-signature
// @access  Private (Instructor/Admin)
exports.getUploadSignature = async (req, res, next) => {
    try {
        const paramsToSign = req.body.paramsToSign;
        if (!paramsToSign) {
            return res.status(400).json({ success: false, message: 'No parameters provided to sign' });
        }

        const signature = cloudinary.generateSignature(paramsToSign);

        res.status(200).json({
            success: true,
            data: {
                signature,
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ status: 'published' }).populate('instructor', 'name');
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single course (Smart Visibility)
// @route   GET /api/v1/courses/:id
// @access  Public (Metadata) / Protected (Content)
exports.getCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        const course = await Course.findById(courseId)
            .populate({
                path: 'modules',
                populate: [
                    { path: 'lessons' },
                    { path: 'quizzes' }
                ]
            })
            .populate('instructor', 'name');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check Access Permission (Enrolled, Instructor, or Admin)
        const isInstructor = course.instructor._id.toString() === userId;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';
        
        let isEnrolled = false;
        if (!isInstructor && !isAdmin) {
            const enrollment = await Enrollment.findOne({
                student: userId,
                course: courseId,
                status: 'completed'
            });
            isEnrolled = !!enrollment;
        }

        // If NOT authorized to see full content, strip sensitive data
        if (!isInstructor && !isAdmin && !isEnrolled) {
            course.modules.forEach(module => {
                module.lessons.forEach(lesson => {
                    // Hide the sensitive data but keep the metadata
                    lesson.videoUrl = null;
                    lesson.videoPublicId = null;
                    lesson.attachments = [];
                    // Keep title, description, duration for preview
                });
            });
        }

        res.status(200).json({ 
            success: true, 
            isEnrolled: isInstructor || isAdmin || isEnrolled,
            data: course 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get signed video URL for a lesson
// @route   GET /api/v1/courses/:courseId/lessons/:lessonId/video
// @access  Private (Enrolled/Authorized)
exports.getLessonVideoUrl = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const Lesson = require('../models/Lesson');
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (!lesson.videoPublicId) {
            return res.status(400).json({ success: false, message: 'This lesson does not have a secure video ID' });
        }

        // Generate Signed URL
        const signedUrl = cloudinary.getSignedUrl(lesson.videoPublicId);

        res.status(200).json({
            success: true,
            videoUrl: signedUrl
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Create course
// @route   POST /api/v1/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.instructor = req.user.id;

        // Force status to draft on creation
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            req.body.status = 'draft';
        }

        const course = await Course.create(req.body);

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'CREATE_COURSE',
            resource: 'Course',
            details: `Created course: ${course.title}`,
            entityId: course._id
        });

        res.status(201).json({ success: true, data: course });
    } catch (err) {
        console.error('Course Creation Error:', err);
        res.status(400).json({ 
            success: false, 
            message: err.message,
            validationErrors: err.errors
        });
    }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Make sure user is course instructor or admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this course' });
        }

        // workflow enforcement: Prevent instructors from self-publishing
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            if (req.body.status === 'published' || req.body.status === 'rejected') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Instructors can only set status to draft or pending. Admin review is required for publishing.' 
                });
            }
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_COURSE',
            resource: 'Course',
            details: `Updated course: ${course.title}`,
            entityId: course._id
        });

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update course status (Admin Flow)
// @route   PATCH /api/v1/courses/:id/status
// @access  Private (Admin)
exports.updateCourseStatus = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.status = req.body.status;
        if (req.body.feedback) {
            course.feedback = req.body.feedback;
        }
        await course.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_COURSE_STATUS',
            resource: 'Course',
            details: `Updated course status: ${course.title} to ${course.status}`,
            entityId: course._id
        });

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Bulk Sync Course Structure (Modules, Lessons, Quizzes)
// @route   PUT /api/v1/courses/:id/bulk-sync
// @access  Private (Instructor/Admin)
exports.bulkSyncCourse = async (req, res, next) => {
    try {
        const { modules, status, ...courseData } = req.body;
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to sync this course' });
        }

        // workflow enforcement: Prevent instructors from self-publishing
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            if (status === 'published' || status === 'rejected') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Instructors can only set status to draft or pending. Admin review is required for publishing.' 
                });
            }
        }

        // 1. Update Course Base Data
        course = await Course.findByIdAndUpdate(req.params.id, { ...courseData, status }, { new: true });

        // 2. Sync Modules
        const moduleIdsInPayload = modules.map(m => m.id).filter(id => id.length > 20);
        
        // Delete modules not in payload
        await Module.deleteMany({ course: course._id, _id: { $nin: moduleIdsInPayload } });

        for (let i = 0; i < modules.length; i++) {
            const modData = modules[i];
            let moduleId;
            const isNewModule = modData.id.length < 20;

            if (isNewModule) {
                const newMod = await Module.create({ title: modData.title, course: course._id, order: i });
                moduleId = newMod._id;
            } else {
                await Module.findByIdAndUpdate(modData.id, { title: modData.title, order: i });
                moduleId = modData.id;
            }

            // 3. Sync Lessons for this module
            const lessonIdsInPayload = modData.lessons.map(l => l.id).filter(id => id.length > 20);
            await Lesson.deleteMany({ module: moduleId, _id: { $nin: lessonIdsInPayload } });

            for (let j = 0; j < modData.lessons.length; j++) {
                const lessonData = modData.lessons[j];
                const isNewLesson = lessonData.id.length < 20;
                const lessonPayload = {
                    title: lessonData.title,
                    videoUrl: lessonData.videoUrl,
                    videoPublicId: lessonData.videoPublicId,
                    type: lessonData.type,
                    attachments: lessonData.attachments,
                    order: j,
                    module: moduleId
                };


                if (isNewLesson) {
                    await Lesson.create(lessonPayload);
                } else {
                    await Lesson.findByIdAndUpdate(lessonData.id, lessonPayload);
                }
            }

            // 4. Sync Quizzes for this module
            if (modData.quizzes) {
                const quizIdsInPayload = modData.quizzes.map(q => q.id).filter(id => id.length > 20);
                await Quiz.deleteMany({ module: moduleId, _id: { $nin: quizIdsInPayload } });

                for (let k = 0; k < modData.quizzes.length; k++) {
                    const quizData = modData.quizzes[k];
                    const isNewQuiz = quizData.id.length < 20;
                    const quizPayload = {
                        title: quizData.title,
                        description: quizData.description,
                        randomize: quizData.randomize,
                        questions: quizData.questions,
                        module: moduleId,
                        course: course._id
                    };

                    if (isNewQuiz) {
                        await Quiz.create(quizPayload);
                    } else {
                        await Quiz.findByIdAndUpdate(quizData.id, quizPayload);
                    }
                }
            }
        }

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'BULK_SYNC_COURSE',
            resource: 'Course',
            details: `Bulk synced course: ${course.title}`,
            entityId: course._id
        });

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        console.error('Bulk Sync Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all courses created by the current instructor
// @route   GET /api/v1/courses/instructor/me
// @access  Private (Instructor/Admin)
exports.getInstructorCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ instructor: req.user.id })
            .sort('-createdAt')
            .populate('modules');

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete course (Soft Delete)
// @route   DELETE /api/v1/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Make sure user is course instructor or admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this course' });
        }

        course.isActive = false;
        await course.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'DELETE_COURSE',
            resource: 'Course',
            details: `Soft deleted course: ${course.title}`,
            entityId: course._id
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all students enrolled in instructor's courses with progress/perf data
// @route   GET /api/v1/courses/instructor-students
// @access  Private (Instructor/Admin)
exports.getInstructorStudents = async (req, res, next) => {
    try {
        // 1. Get instructor courses
        const courses = await Course.find({ instructor: req.user.id, isActive: { $ne: false } })
            .populate({
                path: 'modules',
                populate: { path: 'lessons', select: '_id' }
            });

        const courseIds = courses.map(c => c._id);

        // 2. Get enrollments
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email')
            .populate('course', 'title');

        // 3. Enhance enrollment data with progress and results
        const Progress = require('../models/Progress');
        const Result = require('../models/Result');

        const studentData = await Promise.all(enrollments.map(async (enr) => {
            const course = courses.find(c => c._id.toString() === enr.course._id.toString());
            
            // Calculate total lessons
            let totalLessons = 0;
            course.modules.forEach(m => totalLessons += m.lessons.length);

            // Get completed lessons count
            const completedCount = await Progress.countDocuments({
                student: enr.student._id,
                course: enr.course._id,
                isCompleted: true
            });

            // Get latest quiz result
            const Quizzes = require('../models/Quiz');
            const courseQuizzes = await Quizzes.find({ course: enr.course._id }).select('_id');
            const quizIds = courseQuizzes.map(q => q._id);

            const latestResult = await Result.findOne({
                student: enr.student._id,
                quiz: { $in: quizIds }
            }).sort('-attemptedAt').populate('quiz', 'title');

            return {
                _id: enr._id,
                student: enr.student,
                course: enr.course,
                enrolledAt: enr.enrolledAt,
                progress: {
                    completed: completedCount,
                    total: totalLessons,
                    percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
                },
                latestQuiz: latestResult ? {
                    title: latestResult.quiz.title,
                    score: latestResult.score,
                    maxScore: latestResult.totalQuestions,
                    percentage: (latestResult.score / latestResult.totalQuestions) * 100,
                    passed: latestResult.passed
                } : null
            };
        }));

        res.status(200).json({
            success: true,
            count: studentData.length,
            data: studentData
        });
    } catch (err) {
        console.error('getInstructorStudents Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};



