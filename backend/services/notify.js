const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create one notification for a single recipient.
 * Returns the saved doc. Errors are caught and logged so callers don't crash
 * the calling action just because notifications failed to write.
 */
async function notifyUser({ recipient, type, title, message, link = '', entity }) {
    try {
        if (!recipient) return null;
        return await Notification.create({ recipient, type, title, message, link, entity });
    } catch (err) {
        console.error('[notify] notifyUser failed:', err.message);
        return null;
    }
}

/**
 * Fan out the same notification to every user with one of the given roles.
 * Useful for "tell all admins" or "tell every student about a new coupon".
 */
async function notifyRoles(roles, payload) {
    try {
        const users = await User.find({ role: { $in: Array.isArray(roles) ? roles : [roles] }, isActive: { $ne: false } })
            .select('_id');
        const docs = users.map(u => ({
            recipient: u._id,
            recipientRole: roles[0] || roles,
            ...payload
        }));
        if (docs.length === 0) return [];
        return await Notification.insertMany(docs);
    } catch (err) {
        console.error('[notify] notifyRoles failed:', err.message);
        return [];
    }
}

/**
 * Notify every student enrolled in a particular course.
 */
async function notifyCourseStudents(courseId, payload) {
    try {
        const Enrollment = require('../models/Enrollment');
        const enrolled = await Enrollment.find({ course: courseId, status: 'completed' }).select('student');
        const studentIds = enrolled.map(e => e.student);
        if (studentIds.length === 0) return [];
        const docs = studentIds.map(id => ({ recipient: id, ...payload }));
        return await Notification.insertMany(docs);
    } catch (err) {
        console.error('[notify] notifyCourseStudents failed:', err.message);
        return [];
    }
}

module.exports = {
    notifyUser,
    notifyRoles,
    notifyCourseStudents
};
