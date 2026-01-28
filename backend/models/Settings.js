const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // System Configuration
    interviewTime: { type: Number, default: 30 }, // minutes
    maxAttempts: { type: Number, default: 1 },
    cameraMonitoring: { type: Boolean, default: false },
    tabSwitchDetection: { type: Boolean, default: false },
    autoPublishResult: { type: Boolean, default: false },

    // Email / Notification Settings
    smtpHost: { type: String },
    smtpEmail: { type: String },
    smtpPassword: { type: String },
    sendInterviewLink: { type: Boolean, default: true },
    sendResultEmail: { type: Boolean, default: true },

    // Interview Rules
    allowResumeUpload: { type: Boolean, default: false },
    allowReattempt: { type: Boolean, default: false },
    autoSubmitOnTimeEnd: { type: Boolean, default: true },
    negativeMarking: { type: Boolean, default: false },

    // Theme / UI Settings
    darkMode: { type: Boolean, default: false },
    primaryColor: { type: String, default: '#1976d2' }, // default blue
    logoUrl: { type: String },

    // Role & Permission Management (store as JSON)
    roles: { type: mongoose.Schema.Types.Mixed }, // e.g., { Admin: { createQuestion: true, deleteQuestion: false } }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
