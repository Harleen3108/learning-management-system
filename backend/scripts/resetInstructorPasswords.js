/**
 * One-time fix script: resets every approved instructor's password to
 * `<firstname>123` (lowercase) so they can log in.
 *
 * Run with:
 *   cd E:\LMS\backend
 *   node scripts/resetInstructorPasswords.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error('No MONGO_URI / MONGODB_URI found in environment.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const instructors = await User.find({
        $or: [
            { role: 'instructor' },
            { instructorStatus: 'approved' }
        ]
    }).select('+password');

    console.log(`Found ${instructors.length} instructor account(s) to process.`);

    for (const u of instructors) {
        const rawFirst = (u.name || '').trim().split(/\s+/)[0] || 'instructor';
        const firstName = rawFirst.toLowerCase().replace(/[^a-z0-9]/g, '') || 'instructor';
        const newPassword = `${firstName}123`;

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        await User.updateOne({ _id: u._id }, { $set: { password: hashed } });
        console.log(`  ✓ ${u.email}  ->  ${newPassword}`);
    }

    console.log('\nDone. All listed instructors can now log in with the password shown above.');
    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
