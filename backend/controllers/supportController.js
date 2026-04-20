const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');

// @desc    Get all tickets with filtering
// @route   GET /api/v1/support/tickets
// @access  Private (Admin)
exports.getTickets = async (req, res, next) => {
    try {
        const { status, priority, category, search } = req.query;
        let query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('user', 'name email role')
            .sort('-lastUpdated');

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single ticket
// @route   GET /api/v1/support/tickets/:id
// @access  Private (Admin)
exports.getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('user', 'name email role')
            .populate('messages.sender', 'name role');

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update ticket details (Status/Priority)
// @route   PUT /api/v1/support/tickets/:id
// @access  Private (Admin)
exports.updateTicket = async (req, res, next) => {
    try {
        const { status, priority } = req.body;
        
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        
        ticket.lastUpdated = Date.now();
        await ticket.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'UPDATE_TICKET_METADATA',
            resource: 'Ticket',
            details: `Updated ticket ${ticket._id} status to ${status || ticket.status} and priority to ${priority || ticket.priority}`,
            entityId: ticket._id
        });

        res.status(200).json({ success: true, data: ticket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Admin reply to ticket
// @route   POST /api/v1/support/tickets/:id/replies
// @access  Private (Admin)
exports.addReply = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const reply = {
            sender: req.user.id,
            message: req.body.message,
            attachments: req.body.attachments || []
        };

        ticket.messages.push(reply);
        ticket.status = 'In Progress'; // Auto update status on admin reply
        ticket.lastUpdated = Date.now();
        
        await ticket.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'ADMIN_TICKET_REPLY',
            resource: 'Ticket',
            details: `Admin replied to ticket: ${ticket.subject}`,
            entityId: ticket._id
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get support statistics
// @route   GET /api/v1/support/stats
// @access  Private (Admin)
exports.getSupportStats = async (req, res, next) => {
    try {
        const total = await Ticket.countDocuments();
        const open = await Ticket.countDocuments({ status: 'Open' });
        const inProgress = await Ticket.countDocuments({ status: 'In Progress' });
        const resolved = await Ticket.countDocuments({ status: 'Resolved' });

        res.status(200).json({
            success: true,
            data: {
                total,
                open,
                inProgress,
                resolved,
                urgent: await Ticket.countDocuments({ priority: 'Urgent', status: { $ne: 'Closed' } })
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
