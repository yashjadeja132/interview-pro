const express = require("express");
const router = express.Router();
const adminDashboardController = require("../../controllers/admin/AdminDashboardController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware("Admin"));

// Dashboard routes
router.get("/test", adminDashboardController.testEndpoint);
router.get("/stats", adminDashboardController.getDashboardStats);
router.get("/analytics", adminDashboardController.getAnalytics);

module.exports = router;
