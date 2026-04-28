const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { createOrder, verifySignature } = require('../services/payment');
const AuditLog = require('../models/AuditLog');

// @desc    Enroll in a course
// @route   POST /api/v1/enrollments/:courseId
// @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        const existing = await Enrollment.findOne({ student: req.user.id, course: course._id });
        if (existing && existing.status === 'completed') {
            return res.status(201).json({ success: true, data: existing, message: 'Already enrolled' });
        }

        // If course is Free
        if (course.price === 0) {
            const enrollment = await Enrollment.create({
                student: req.user.id,
                course: course._id,
                status: 'completed',
                amount: 0
            });

            // Log action
            await AuditLog.create({
                user: req.user.id,
                action: 'ENROLL_COURSE_FREE',
                resource: 'Course',
                details: `Enrolled in free course: ${course.title}`,
                entityId: enrollment._id
            });

            return res.status(201).json({ success: true, data: enrollment });
        }

        // If course is Paid -> Create Razorpay Order
        const order = await createOrder(course.price);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const User = require('../models/User');
const { linkParent } = require('../utils/parentLinker');
const { sendParentNotification } = require('../services/notificationService');

// @desc    Verify Payment & Confirm Enrollment
// @route   POST /api/v1/enrollments/verify
// @access  Private (Student)
exports.verifyPayment = async (req, res, next) => {
    try {
        const { courseId, razorpayOrderId, razorpayPaymentId, razorpaySignature, parentEmail, parentPhone, parentName } = req.body;

        const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: courseId,
            status: 'completed',
            paymentId: razorpayPaymentId,
            orderId: razorpayOrderId
        });

        // Get student and course details for notification
        const student = await User.findById(req.user.id);
        const course = await Course.findById(courseId);

        // Link parent and notify
        if (student.role === 'student') {
            let parent = null;
            if (student.linkedParent) {
                parent = await User.findById(student.linkedParent);
            } else if (parentEmail || parentPhone) {
                parent = await linkParent(student, { email: parentEmail, phone: parentPhone, name: parentName });
            }

            if (parent) {
                await sendParentNotification({
                    parentName: parent.name,
                    studentName: student.name,
                    action: 'purchase',
                    courseName: course.title,
                    price: course.price,
                    parentEmail: parent.email,
                    password: 'pass123'
                });
            }
        }

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'ENROLL_COURSE_PAID',
            resource: 'Course',
            details: `Enrolled in paid course: ${course.title}`,
            entityId: enrollment._id
        });

        res.status(201).json({ success: true, data: enrollment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
