const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function findData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./backend/models/User');
        const Category = require('./backend/models/Category');

        const soham = await User.findOne({ name: /Soham/i });
        const heman = await User.findOne({ name: /Heman/i });
        const categories = await Category.find();

        console.log('Soham:', soham ? { id: soham._id, name: soham.name } : 'Not found');
        console.log('Heman:', heman ? { id: heman._id, name: heman.name } : 'Not found');
        console.log('Categories:', categories.map(c => ({ id: c._id, name: c.name, parentId: c.parentId })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findData();
