const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/SettingsController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

// Apply auth and admin role to all routes
router.use(authMiddleware);
router.use(roleMiddleware('Admin'));

// GET settings (optional ?section=...)
router.get('/', settingsController.getSettings);

// PUT update settings
router.put('/', settingsController.updateSettings);

// GET audit logs
router.get('/audit-logs', settingsController.getAuditLogs);

module.exports = router;
