const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'UPDATE_SETTINGS', 'CHANGE_PASSWORD'
    target: { type: String }, // optional, e.g., 'system', 'email'
    details: { type: mongoose.Schema.Types.Mixed }, // any extra info
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
