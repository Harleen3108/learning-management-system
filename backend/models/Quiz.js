const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    module: {
        type: mongoose.Schema.ObjectId,
        ref: 'Module',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a quiz title']
    },
    description: String,
    randomize: {
        type: Boolean,
        default: true
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        explanation: String
    }],
    passingScore: {
        type: Number,
        default: 60 // Percentage
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
