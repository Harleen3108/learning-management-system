const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
    {
        name: 'Super Admin',
        email: 'admin@eduflow.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        name: 'Master Instructor',
        email: 'instructor@eduflow.com',
        password: 'instructor123',
        role: 'instructor'
    },
    {
        name: 'Alex Student',
        email: 'student@eduflow.com',
        password: 'student123',
        role: 'student'
    },
    {
        name: 'Peter Parent',
        email: 'parent@eduflow.com',
        password: 'parent123',
        role: 'parent'
    }
];

const seedUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined in .env');
        
        await mongoose.connect(uri);
        console.log('MongoDB Connected for seeding...');

        // Clear existing test users if they exist
        await User.deleteMany({ email: { $in: users.map(u => u.email) } });

        // Create new users
        await User.create(users);

        console.log('✅ 4 Users seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
