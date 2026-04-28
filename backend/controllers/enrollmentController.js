const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Coupon = require('../models/Coupon');
const { createOrder, verifySignature } = require('../services/payment');
const AuditLog = require('../models/AuditLog');

// Use the discounted price when it's set and lower than the list price.
// Pricing is what the student actually pays, not the list price.
function effectivePrice(course) {
    const list = Number(course.price) || 0;
    const disc = Number(course.discountPrice) || 0;
    if (disc > 0 && disc < list) return disc;
    return list;
}

// Compute total for a list of courses, applying a coupon if provided.
async function computeCartTotals(courseIds, couponCode) {
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length === 0) {
        const err = new Error('No valid courses in cart');
        err.code = 400;
        throw err;
    }

    const lineItems = courses.map(c => ({
        courseId: c._id,
        title: c.title,
        listPrice: Number(c.price) || 0,
        unitPrice: effectivePrice(c)
    }));

    const subtotal = lineItems.reduce((s, li) => s + li.unitPrice, 0);

    let coupon = null;
    let discount = 0;
    if (couponCode) {
        coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
        if (!coupon) {
            const err = new Error('Invalid coupon code');
            err.code = 400;
            throw err;
        }
        if (!coupon.isActive) {
            const err = new Error('This coupon is no longer active');
            err.code = 400;
            throw err;
        }
        if (Date.now() > new Date(coupon.expiresAt).getTime()) {
            const err = new Error('This coupon has expired');
            err.code = 400;
            throw err;
        }
        if (coupon.usedCount >= coupon.maxUses) {
            const err = new Error('This coupon has reached its usage limit');
            err.code = 400;
            throw err;
        }
        if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
            discount = Math.min(subtotal, Math.round(coupon.discountValue));
        }
    }

    const total = Math.max(0, subtotal - discount);
    return { lineItems, subtotal, discount, total, coupon };
}

// @desc    Enroll in a course (single)
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

        // Use the discounted price the instructor set, not the list price
        const payable = effectivePrice(course);

        // If course is Free
        if (payable === 0) {
            const enrollment = await Enrollment.create({
                student: req.user.id,
                course: course._id,
                status: 'completed',
                amount: 0
            });

            await AuditLog.create({
                user: req.user.id,
                action: 'ENROLL_COURSE_FREE',
                resource: 'Course',
                details: `Enrolled in free course: ${course.title}`,
                entityId: enrollment._id
            });

            return res.status(201).json({ success: true, data: enrollment });
        }

        // Paid → create Razorpay order with discounted price
        const order = await createOrder(payable);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            payable
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a Razorpay order for the cart (multiple courses, optional coupon)
// @route   POST /api/v1/enrollments/cart/order
// @access  Private (Student)
exports.createCartOrder = async (req, res, next) => {
    try {
        const { courseIds = [], couponCode } = req.body;
        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Skip courses the user is already enrolled in
        const alreadyEnrolled = await Enrollment.find({
            student: req.user.id,
            course: { $in: courseIds },
            status: 'completed'
        }).select('course');
        const alreadyIds = alreadyEnrolled.map(e => e.course.toString());
        const filteredIds = courseIds.filter(id => !alreadyIds.includes(id.toString()));

        if (filteredIds.length === 0) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in all cart items' });
        }

        const { lineItems, subtotal, discount, total, coupon } = await computeCartTotals(filteredIds, couponCode);

        // 100% discount or all items free → enroll directly, no payment needed
        if (total === 0) {
            const enrollments = [];
            for (const li of lineItems) {
                const enrollment = await Enrollment.create({
                    student: req.user.id,
                    course: li.courseId,
                    status: 'completed',
                    amount: 0
                });
                enrollments.push(enrollment);
            }
            if (coupon) {
                coupon.usedCount = (coupon.usedCount || 0) + 1;
                await coupon.save();
            }
            return res.status(201).json({
                success: true,
                free: true,
                enrollments,
                summary: { subtotal, discount, total }
            });
        }

        const order = await createOrder(total);

        // Pre-create pending enrollments tagged with the orderId so verify can flip them to completed.
        for (const li of lineItems) {
            await Enrollment.findOneAndUpdate(
                { student: req.user.id, course: li.courseId, status: { $ne: 'completed' } },
                {
                    student: req.user.id,
                    course: li.courseId,
                    status: 'pending',
                    orderId: order.id,
                    amount: li.unitPrice
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            summary: { lineItems, subtotal, discount, total },
            coupon: coupon ? { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } : null
        });
    } catch (err) {
        const status = err.code || 400;
        return res.status(status).json({ success: false, message: err.message || 'Failed to start checkout' });
    }
};

// @desc    Verify cart payment and complete all enrollments
// @route   POST /api/v1/enrollments/cart/verify
// @access  Private (Student)
exports.verifyCartPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, couponCode } = req.body;

        if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Mark all enrollments tied to this order as completed
        const result = await Enrollment.updateMany(
            { student: req.user.id, orderId: razorpayOrderId },
            { status: 'completed', paymentId: razorpayPaymentId }
        );

        // Increment coupon usage if used
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.trim().toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        const enrollments = await Enrollment.find({
            student: req.user.id,
            orderId: razorpayOrderId
        }).populate('course', 'title instructor');

        // Notify each course's instructor about the new enrollment
        try {
            const { notifyUser } = require('../services/notify');
            const studentName = (await User.findById(req.user.id))?.name || 'A student';
            for (const e of enrollments) {
                if (e.course?.instructor) {
                    await notifyUser({
                        recipient: e.course.instructor,
                        type: 'new_enrollment',
                        title: 'New student enrolled',
                        message: `${studentName} just enrolled in "${e.course.title}".`,
                        link: '/dashboard/instructor/students',
                        entity: { type: 'Course', id: e.course._id }
                    });
                }
            }
        } catch (e) { console.error('[notify] enrollment:', e.message); }

        await AuditLog.create({
            user: req.user.id,
            action: 'CART_CHECKOUT',
            resource: 'Cart',
            details: `Completed cart checkout for ${enrollments.length} course(s).`,
            entityId: razorpayOrderId
        });

        return res.status(201).json({
            success: true,
            updated: result.modifiedCount,
            enrollments
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
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

        // Notify the instructor
        try {
            const { notifyUser } = require('../services/notify');
            if (course.instructor) {
                await notifyUser({
                    recipient: course.instructor,
                    type: 'new_enrollment',
                    title: 'New student enrolled',
                    message: `${student?.name || 'A student'} just enrolled in "${course.title}".`,
                    link: '/dashboard/instructor/students',
                    entity: { type: 'Course', id: course._id }
                });
            }
        } catch (e) { console.error('[notify] single enrollment:', e.message); }

        res.status(201).json({ success: true, data: enrollment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
