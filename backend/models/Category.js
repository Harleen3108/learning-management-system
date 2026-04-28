const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    icon: {
        type: String,
        default: 'LayoutGrid' // Lucide icon name
    },
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    topics: [{
        type: String,
        trim: true
    }],
    isVisibleOnHome: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
    this.slug = this.name
        .toLowerCase()
        .split(' ')
        .join('-')
        .replace(/[^\w-]+/g, '');
    next();
});

module.exports = mongoose.model('Category', categorySchema);
