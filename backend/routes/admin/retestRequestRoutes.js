const express = require("express");
const {
  getPendingRetestRequests,
  getAllRetestRequests,
  approveRetestRequest,
  rejectRetestRequest,
  getPendingCount,
  getCandidateHistory
} = require("../../controllers/admin/retestRequestController");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const router = express.Router();

// Admin routes for retest requests
router.get("/pending", authMiddleware, roleMiddleware(["Admin", "HR"]), getPendingRetestRequests);
router.get("/all", authMiddleware, roleMiddleware(["Admin", "HR"]), getAllRetestRequests);
router.get("/pending/count", authMiddleware, roleMiddleware(["Admin", "HR"]), getPendingCount);
router.put("/:requestId/approve", authMiddleware, roleMiddleware(["Admin", "HR"]), approveRetestRequest);
router.put("/:requestId/reject", authMiddleware, roleMiddleware(["Admin", "HR"]), rejectRetestRequest);
router.get("/candidate/:candidateId/position/:positionId/history", authMiddleware, roleMiddleware(["Admin", "HR"]), getCandidateHistory);

module.exports = router;

