const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    resourceId: String,
    entityId: String, // Added for backward compatibility/flexibility
    details: String,  // Added for human-readable summaries
    oldData: Object,
    newData: Object,
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Indexes for optimization
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
