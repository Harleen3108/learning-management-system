const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');

dotenv.config({ path: path.join(__dirname, '../.env') });

const addCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const categories = [
            { 
                name: 'Generative AI', 
                description: 'Explore the world of LLMs, Diffusion Models, and AI Creativity.',
                isVisibleOnHome: true,
                topics: ['AI', 'Generative', 'LLM']
            },
            { 
                name: 'Web Development', 
                description: 'Master frontend, backend, and full-stack development.',
                isVisibleOnHome: true,
                topics: ['React', 'Node', 'Next.js']
            }
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Added: ${cat.name}`);
            } else {
                console.log(`Exists: ${cat.name}`);
            }
        }

        console.log('✅ Done!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addCategories();
