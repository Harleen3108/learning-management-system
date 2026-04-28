const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const User = require('../backend/models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const counts = await User.aggregate([
            {
                $group: {
                    _id: { role: '$role', status: '$instructorStatus' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('User Distribution:', JSON.stringify(counts, null, 2));
        
        const pendingApplications = await mongoose.model('InstructorApplication', new mongoose.Schema({})).countDocuments({ status: 'pending' });
        console.log('Pending Applications:', pendingApplications);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
