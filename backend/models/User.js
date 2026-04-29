const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'instructor', 'student', 'parent'],
        default: 'student'
    },
    studentCode: {
        type: String,
        unique: true,
        sparse: true // Only for students
    },
    linkedStudents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    linkedParent: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    dob: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    instructorStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
    },
    instructorBio: {
        type: String,
        trim: true
    },
    instructorSpecialty: {
        type: String,
        trim: true
    },
    profilePhoto: {
        type: String,
        default: 'no-photo.jpg'
    },
    socialLinks: {
        website: String,
        linkedin: String,
        twitter: String,
        youtube: String
    },
    phone: {
        type: String,
        trim: true
    },

    // ─────────────── Public profile (Coursera-style) ───────────────
    profile: {
        about: { type: String, trim: true, maxlength: 500 },
        occupation: { type: String, trim: true },
        interests: [{ type: String, trim: true }],
        resumeUrl: { type: String, trim: true },
        // Up to 5 free-form labelled URLs the learner can share (LinkedIn, GitHub, etc.)
        links: [{
            label: { type: String, trim: true },
            url: { type: String, trim: true }
        }],
        // Roles & relocation preferences for recruiter-facing context
        workPreferences: {
            role: { type: String, trim: true },
            industry: { type: String, trim: true },
            openToRemote: { type: Boolean, default: false },
            willingToRelocate: { type: Boolean, default: false }
        },
        // Past jobs / internships
        workHistory: [{
            title: { type: String, trim: true, required: true },
            company: { type: String, trim: true, required: true },
            startDate: Date,
            endDate: Date, // null/undefined = present
            description: { type: String, trim: true }
        }],
        // Schools, bootcamps, etc.
        education: [{
            school: { type: String, trim: true, required: true },
            degree: { type: String, trim: true },
            field: { type: String, trim: true },
            startYear: Number,
            endYear: Number
        }],
        // Whether the public share link is enabled
        isPublic: { type: Boolean, default: true }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt – only when password is modified.
// IMPORTANT: must `return next()` early; otherwise the hook re-hashes
// an already-hashed password on every save, breaking authentication.
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes for optimization
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
