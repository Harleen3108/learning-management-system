const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Unset instructorStatus for all users who are role 'student' or 'parent' 
        // and have not explicitly applied (we assume 'pending' was the default)
        const result = await User.updateMany(
            { 
                role: { $in: ['student', 'parent'] },
                instructorStatus: 'pending'
            },
            { $unset: { instructorStatus: "" } }
        );

        console.log(`Successfully cleaned up ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
