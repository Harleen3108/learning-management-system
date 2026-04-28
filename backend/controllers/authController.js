const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { linkParent } = require('../utils/parentLinker');
const axios = require('axios');

const { sendParentNotification } = require('../services/notificationService');

// @desc    Google Auth
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
    try {
        const { access_token, role } = req.body;

        if (!access_token) {
            return res.status(400).json({ success: false, message: 'Google access token is required' });
        }

        // Fetch user info from Google
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { email, name, picture } = response.data;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Failed to retrieve email from Google' });
        }

        // Check if user exists
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            // Create user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: role || 'student',
                profilePhoto: picture || 'no-photo.jpg'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.response?.data?.error_description || err.message });
    }
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, dob, parentEmail, parentPhone, parentName } = req.body;

        // Validation for students
        if (role === 'student') {
            if (!parentEmail && !parentPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent Email or Phone Number is compulsory for student registration.'
                });
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            dob
        });

        // Link parent if student
        if (role === 'student') {
            const parent = await linkParent(user, { email: parentEmail, phone: parentPhone, name: parentName });
            
            // Send notification to parent
            await sendParentNotification({
                parentName: parent.name,
                studentName: user.name,
                action: 'registration',
                parentEmail: parent.email,
                password: 'pass123'
            });
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password, phone, parentName, studentName, studentDob } = req.body;
        let user;

        // 1. Advanced Parent Login Logic
        if (parentName && studentName && studentDob) {
            const student = await User.findOne({ 
                name: { $regex: new RegExp(`^${studentName}$`, 'i') }, 
                dob: studentDob,
                role: 'student'
            });
            
            if (!student || !student.linkedParent) {
                return res.status(401).json({ success: false, message: 'Invalid student details provided.' });
            }
            
            user = await User.findOne({ 
                _id: student.linkedParent,
                name: { $regex: new RegExp(`^${parentName}$`, 'i') }
            }).select('+password');
        } 
        // 2. Standard Email/Phone Login
        else {
            const identifier = email || phone;
            if (!identifier || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide Email/Phone and Password'
                });
            }

            user = await User.findOne({ 
                $or: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }).select('+password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(req.body.currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
        options.sameSite = 'none'; // Required for cross-origin (Vercel → Render)
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};
