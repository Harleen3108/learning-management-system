const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // 1. Ensure Instructors exist
        const instructors = [
            { name: 'Soham', email: 'soham@eduflow.com', password: 'password123', role: 'instructor' },
            { name: 'Heman', email: 'heman@eduflow.com', password: 'password123', role: 'instructor' }
        ];

        for (const inst of instructors) {
            const exists = await User.findOne({ email: inst.email });
            if (!exists) await User.create(inst);
        }

        const soham = await User.findOne({ email: 'soham@eduflow.com' });
        const heman = await User.findOne({ email: 'heman@eduflow.com' });

        // 2. Ensure 6 Categories exist
        const catNames = ['Development', 'Design', 'Marketing', 'Business', 'Photography', 'Music'];
        const categoryMap = {};

        for (const name of catNames) {
            let cat = await Category.findOne({ name });
            if (!cat) {
                cat = await Category.create({ 
                    name, 
                    description: `${name} courses for professional growth`,
                    isVisibleOnHome: true,
                    topics: [name, 'Skill', 'Basics']
                });
            }
            categoryMap[name] = cat._id;
        }

        // 3. Create 10 Courses
        const courseTitles = [
            { title: 'Full Stack Web Mastery', instructor: soham._id, category: categoryMap['Development'] },
            { title: 'Advanced UI/UX Design Systems', instructor: heman._id, category: categoryMap['Design'] },
            { title: 'Digital Marketing Strategies 2024', instructor: soham._id, category: categoryMap['Marketing'] },
            { title: 'Financial Intelligence for Entrepreneurs', instructor: heman._id, category: categoryMap['Business'] },
            { title: 'Professional Portrait Photography', instructor: soham._id, category: categoryMap['Photography'] },
            { title: 'Electronic Music Production with Ableton', instructor: heman._id, category: categoryMap['Music'] },
            { title: 'React & Next.js Enterprise Patterns', instructor: soham._id, category: categoryMap['Development'] },
            { title: 'Graphic Design Masterclass', instructor: heman._id, category: categoryMap['Design'] },
            { title: 'SEO & Content Marketing Bootcamp', instructor: soham._id, category: categoryMap['Marketing'] },
            { title: 'Leadership & Team Management', instructor: heman._id, category: categoryMap['Business'] }
        ];

        for (const c of courseTitles) {
            const course = await Course.create({
                ...c,
                description: `Comprehensive ${c.title} course designed for deep learning.`,
                subtitle: 'Master this skill from scratch with industry experts.',
                price: 1999,
                difficulty: 'intermediate',
                status: 'pending',
                language: 'English',
                whatYouWillLearn: ['Master core concepts', 'Build real-world projects', 'Professional certification'],
                requirements: ['No prior experience needed', 'A working computer', 'Dedication to learn'],
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
            });

            const mod = await Module.create({ title: 'Getting Started', course: course._id, order: 0 });
            await Lesson.create({ 
                title: 'Introduction to the Course', 
                module: mod._id, 
                videoUrl: 'https://res.cloudinary.com/dtadnrc7n/video/upload/v1/samples/elephants.mp4',
                videoPublicId: 'samples/elephants',
                type: 'video',
                order: 0 
            });

            course.modules.push(mod._id);
            await course.save();
        }

        console.log('✅ 10 Courses and 6 Categories seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
};

seed();
