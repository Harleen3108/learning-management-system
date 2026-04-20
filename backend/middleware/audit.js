const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log actions in the AuditLog collection
 * @param {String} action - Description of the action (e.g., 'Update Course')
 */
exports.auditLogger = (action) => {
    return async (req, res, next) => {
        // Original res.json to intercept for successful logging
        const originalJson = res.json;
        
        res.json = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Log only successful actions
                AuditLog.create({
                    user: req.user.id,
                    action: action,
                    resource: req.baseUrl,
                    resourceId: req.params.id || null,
                    newData: req.body,
                    ipAddress: req.ip
                }).catch(err => console.error('Audit Log Error:', err));
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
};
