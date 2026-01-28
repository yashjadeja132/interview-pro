const express = require("express");
const router = express.Router();
const passwordController = require("../../controllers/admin/ProfileController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware("Admin"));

// Password routes
router.put("/", passwordController.changePassword);


module.exports = router;