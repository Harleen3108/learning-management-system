const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await Category.deleteMany({});
        console.log(`Deleted ${result.deletedCount} categories.`);
        console.log('✅ Categories cleared. Now run your add script again to have only your desired categories.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearCategories();
