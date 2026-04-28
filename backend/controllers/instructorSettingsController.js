const InstructorSettings = require('../models/InstructorSettings');
const User = require('../models/User');

// @desc    Get current instructor settings
// @route   GET /api/v1/instructor/settings
// @access  Private/Instructor
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await InstructorSettings.findOne({ instructor: req.user.id });

        if (!settings) {
            // Create default settings if they don't exist yet
            settings = await InstructorSettings.create({ instructor: req.user.id });
        }

        // We also want to send back the user's base information so the frontend has a complete picture
        const user = await User.findById(req.user.id).select('name email profilePhoto instructorBio socialLinks');

        res.status(200).json({ 
            success: true, 
            data: {
                settings,
                user
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update instructor settings
// @route   PUT /api/v1/instructor/settings
// @access  Private/Instructor
exports.updateSettings = async (req, res, next) => {
    try {
        const { settings: settingsData, user: userData } = req.body;

        // 1. Update InstructorSettings
        let settings = await InstructorSettings.findOne({ instructor: req.user.id });
        
        if (!settings) {
            settings = await InstructorSettings.create({ instructor: req.user.id, ...settingsData });
        } else {
            // Update using dot notation or $set to merge properly, or just deep merge
            settings = await InstructorSettings.findOneAndUpdate(
                { instructor: req.user.id },
                { $set: settingsData },
                { new: true, runValidators: true }
            );
        }

        // 2. Sync to User model if provided
        let user = await User.findById(req.user.id);
        if (userData) {
            if (userData.name) user.name = userData.name;
            if (userData.profilePhoto) user.profilePhoto = userData.profilePhoto;
            if (userData.instructorBio) user.instructorBio = userData.instructorBio;
            if (userData.socialLinks) {
                user.socialLinks = { ...user.socialLinks, ...userData.socialLinks };
            }
            await user.save();
        }

        res.status(200).json({ 
            success: true, 
            data: {
                settings,
                user: {
                    name: user.name,
                    email: user.email,
                    profilePhoto: user.profilePhoto,
                    instructorBio: user.instructorBio,
                    socialLinks: user.socialLinks
                }
            } 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
