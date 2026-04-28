const User = require('../models/User');

/**
 * Links a student to a parent. Creates parent account if not exists.
 * @param {Object} student - The student user object
 * @param {Object} parentData - { email, phone, name }
 */
const linkParent = async (student, parentData) => {
    const { email, phone, name } = parentData;
    
    if (!email && !phone) return null;

    let parent = null;
    
    // 1. Try to find parent by email or phone
    if (email) {
        parent = await User.findOne({ email });
    }
    if (!parent && phone) {
        parent = await User.findOne({ phone, role: 'parent' });
    }

    // 2. Create parent if not exists
    if (!parent) {
        parent = await User.create({
            name: name || `Parent of ${student.name}`,
            email: email || `p${Date.now()}@temp.com`, // Fallback for email if only phone provided
            phone: phone,
            password: 'pass123',
            role: 'parent',
            linkedStudents: [student._id]
        });
    } else {
        // Link student to existing parent if not already linked
        if (!parent.linkedStudents.includes(student._id)) {
            parent.linkedStudents.push(student._id);
            await parent.save();
        }
    }

    // 3. Update student with parent ref
    student.linkedParent = parent._id;
    await student.save();

    return parent;
};

module.exports = { linkParent };
