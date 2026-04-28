const mongoose = require('mongoose');

const instructorApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Step 1: Qualification Questions
    qualification: {
        describeSelf: {
            type: String,
            required: true,
            enum: ['Industry Professional', 'Teacher / Trainer', 'Freelancer / Creator', 'Business Owner', 'Other']
        },
        teachingTopic: {
            type: String,
            required: true
        },
        hasTaughtBefore: {
            type: String,
            required: true,
            enum: ['Yes, professionally', 'Yes, informally', 'No, but I have expertise']
        }
    },
    // Step 2: Full Application
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    profilePhoto: String,
    professionalHeadline: String,
    bio: String,
    expertise: String,
    skills: [String],
    teachingExperience: String,
    links: {
        website: String,
        linkedin: String,
        portfolio: String
    },
    resumeUrl: String,
    supportingDocs: [String],
    sampleCourseIdea: String,
    preferredPayoutMethod: {
        type: String,
        enum: ['Bank Transfer', 'PayPal', 'Stripe'],
        default: 'Bank Transfer'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested'],
        default: 'pending'
    },
    adminNotes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InstructorApplication', instructorApplicationSchema);
