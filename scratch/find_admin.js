const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const User = require('../backend/models/User');

async function findAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: { $in: ['admin', 'super-admin'] } });
        if (admin) {
            console.log('Admin Email:', admin.email);
        } else {
            console.log('No admin found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
findAdmin();
