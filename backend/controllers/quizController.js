const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Course = require('../models/Course');
const Module = require('../models/Module');

// @desc    Create quiz for a module
// @route   POST /api/v1/quizzes
// @access  Private (Instructor/Admin)
exports.createQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json({ success: true, data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update quiz
// @route   PUT /api/v1/quizzes/:id
// @access  Private (Instructor/Admin)
exports.updateQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/v1/quizzes/:id
// @access  Private (Instructor/Admin)
exports.deleteQuiz = async (req, res, next) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/v1/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        const { answers } = req.body; // Array of selected option indices

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        let correctCount = 0;
        quiz.questions.forEach((q, index) => {
            const selectedOption = q.options[answers[index]];
            if (selectedOption && selectedOption.isCorrect) {
                correctCount++;
            }
        });

        const score = (correctCount / quiz.questions.length) * 100;
        const passed = score >= quiz.passingScore;

        const result = await Result.create({
            student: req.user.id,
            quiz: quiz._id,
            score,
            correctAnswers: correctCount,
            totalQuestions: quiz.questions.length,
            passed
        });

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get results for a student
// @route   GET /api/v1/quizzes/results/me
// @access  Private (Student)
exports.getMyResults = async (req, res, next) => {
    try {
        const results = await Result.find({ student: req.user.id }).populate('quiz', 'title');
        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get results for an instructor's quizzes
// @route   GET /api/v1/quizzes/results/instructor
// @access  Private (Instructor/Admin)
exports.getInstructorResults = async (req, res, next) => {
    try {
        // Find courses taught by this instructor
        const courses = await Course.find({ instructor: req.user.id });
        const courseIds = courses.map(c => c._id);

        // Find modules in those courses
        const modules = await Module.find({ course: { $in: courseIds } });
        const moduleIds = modules.map(m => m._id);

        // Find quizzes in those modules
        const quizzes = await Quiz.find({ module: { $in: moduleIds } });
        const quizIds = quizzes.map(q => q._id);

        // Find results for those quizzes
        const results = await Result.find({ quiz: { $in: quizIds } })
            .populate('student', 'name email avatar')
            .populate('quiz', 'title');

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
