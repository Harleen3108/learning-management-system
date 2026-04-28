const InstructorApplication = require('../models/InstructorApplication');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const bcrypt = require('bcryptjs');
const { notifyUser, notifyRoles } = require('../services/notify');

// @desc    Submit instructor application
// @route   POST /api/v1/instructor-applications
// @access  Public (auto-provisions a user account if guest)
exports.submitApplication = asyncHandler(async (req, res, next) => {
    let userId = req.user ? req.user.id : null;

    // Guest flow: find existing user by email, or create a new one
    if (!userId) {
        if (!req.body.email || !req.body.fullName) {
            return next(new ErrorResponse('Full name and email are required to apply', 400));
        }

        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            userId = existingUser._id;
        } else {
            // Auto-create a placeholder user; password will be set to firstname123 on approval.
            // Use a random temporary password so the schema's required+minlength constraints pass.
            const tempPassword = Math.random().toString(36).slice(-10) + 'A1';
            const newUser = await User.create({
                name: req.body.fullName,
                email: req.body.email,
                phone: req.body.phone,
                password: tempPassword,
                role: 'student',
                instructorStatus: 'pending',
                instructorBio: req.body.bio,
                instructorSpecialty: req.body.expertise || req.body.qualification?.teachingTopic
            });
            userId = newUser._id;
        }
    }

    // Check for an existing pending/changes-requested application for this user
    const existingApplication = await InstructorApplication.findOne({
        user: userId,
        status: { $in: ['pending', 'changes_requested'] }
    });

    if (existingApplication) {
        return next(new ErrorResponse('An application for this account is already pending review', 400));
    }

    req.body.user = userId;

    const application = await InstructorApplication.create(req.body);

    // Update user's instructorStatus and specialty to pending
    await User.findByIdAndUpdate(userId, {
        instructorStatus: 'pending',
        instructorSpecialty: req.body.expertise || req.body.qualification?.teachingTopic
    });

    // Notify all admins
    await notifyRoles(['admin', 'super-admin'], {
        type: 'instructor_application_submitted',
        title: 'New instructor application',
        message: `${req.body.fullName} has applied to become an instructor.`,
        link: '/dashboard/admin/instructor-applications',
        entity: { type: 'InstructorApplication', id: application._id }
    });

    res.status(201).json({
        success: true,
        data: application
    });
});

// @desc    Get my application status
// @route   GET /api/v1/instructor-applications/my-status
// @access  Private
exports.getMyStatus = asyncHandler(async (req, res, next) => {
    const application = await InstructorApplication.findOne({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        data: application
    });
});

// @desc    Get all applications (Admin only)
// @route   GET /api/v1/instructor-applications
// @access  Private/Admin
exports.getApplications = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Update application status (Admin only)
// @route   PUT /api/v1/instructor-applications/:id
// @access  Private/Admin
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
    let application = await InstructorApplication.findById(req.params.id);

    if (!application) {
        return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    application = await InstructorApplication.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // If approved, update user role to instructor (protect admin)
    if (req.body.status === 'approved') {
        const userToUpdate = await User.findById(application.user);

        if (!userToUpdate) {
            return next(new ErrorResponse('Linked user account not found', 404));
        }

        // Generate password as firstname (lowercase, alphanumeric only) + "123"
        const rawFirstName = (application.fullName || '').trim().split(/\s+/)[0] || 'instructor';
        const firstName = rawFirstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'instructor';
        const generatedPassword = `${firstName}123`;

        // Hash password manually to bypass any pre-save hook ambiguity
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        const updateData = {
            instructorStatus: 'approved',
            name: application.fullName,
            phone: application.phone,
            instructorBio: application.bio,
            instructorSpecialty: application.expertise,
            profilePhoto: application.profilePhoto || 'no-photo.jpg',
            password: hashedPassword
        };

        // Only change role if NOT admin
        if (userToUpdate.role !== 'admin' && userToUpdate.role !== 'super-admin') {
            updateData.role = 'instructor';
        }

        // Use findByIdAndUpdate (skips pre-save hook → no double-hashing)
        await User.findByIdAndUpdate(application.user, updateData, { runValidators: false });

        console.log(`[Instructor Approval] User ${userToUpdate.email} approved. Password set to: ${generatedPassword}`);

        // Notify the applicant
        await notifyUser({
            recipient: application.user,
            type: 'instructor_application_approved',
            title: 'Welcome aboard — your application is approved!',
            message: `Sign in with your email and the temporary password "${generatedPassword}" to access your instructor dashboard.`,
            link: '/dashboard/instructor',
            entity: { type: 'InstructorApplication', id: application._id }
        });
    } else if (req.body.status === 'rejected') {
        // If rejected, update user's instructorStatus to rejected
        await User.findByIdAndUpdate(application.user, {
            instructorStatus: 'rejected'
        });

        await notifyUser({
            recipient: application.user,
            type: 'instructor_application_rejected',
            title: 'Update on your instructor application',
            message: req.body.adminNotes || 'After review, we are unable to approve your application at this time.',
            link: '/teach',
            entity: { type: 'InstructorApplication', id: application._id }
        });
    }

    res.status(200).json({
        success: true,
        data: application
    });
});
