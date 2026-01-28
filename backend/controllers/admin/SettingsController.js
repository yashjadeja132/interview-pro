const Settings = require('../../models/Settings');
const AuditLog = require('../../models/AuditLog');

// GET /api/settings/:section? (optional query param to get specific section)
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        // If client passes ?section=system etc., we can filter
        const { section } = req.query;
        if (section) {
            const allowed = ['system', 'email', 'interviewRules', 'theme', 'roles'];
            if (!allowed.includes(section)) {
                return res.status(400).json({ message: 'Invalid section' });
            }
            const data = {};
            switch (section) {
                case 'system':
                    data.interviewTime = settings.interviewTime;
                    data.maxAttempts = settings.maxAttempts;
                    data.cameraMonitoring = settings.cameraMonitoring;
                    data.tabSwitchDetection = settings.tabSwitchDetection;
                    data.autoPublishResult = settings.autoPublishResult;
                    break;
                case 'email':
                    data.smtpHost = settings.smtpHost;
                    data.smtpEmail = settings.smtpEmail;
                    data.smtpPassword = settings.smtpPassword;
                    data.sendInterviewLink = settings.sendInterviewLink;
                    data.sendResultEmail = settings.sendResultEmail;
                    break;
                case 'interviewRules':
                    data.allowResumeUpload = settings.allowResumeUpload;
                    data.allowReattempt = settings.allowReattempt;
                    data.autoSubmitOnTimeEnd = settings.autoSubmitOnTimeEnd;
                    data.negativeMarking = settings.negativeMarking;
                    break;
                case 'theme':
                    data.darkMode = settings.darkMode;
                    data.primaryColor = settings.primaryColor;
                    data.logoUrl = settings.logoUrl;
                    break;
                case 'roles':
                    data.roles = settings.roles;
                    break;
                default:
                    break;
            }
            return res.json({ settings: data });
        }
        res.json({ settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        const updates = req.body; // expect partial updates
        const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true });

        // Audit log entry
        await AuditLog.create({
            adminId: req.user.id,
            action: 'UPDATE_SETTINGS',
            target: 'settings',
            details: updates,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ message: 'Settings updated', settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/settings/audit-logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 logs for now
        res.json({ logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSettings, updateSettings, getAuditLogs };
