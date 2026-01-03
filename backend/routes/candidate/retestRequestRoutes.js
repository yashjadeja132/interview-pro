const express = require("express");
const { requestRetest, getMyRetestRequest } = require("../../controllers/candidate/retestRequestController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Candidate routes for retest requests
router.post("/request", authMiddleware, requestRetest);
router.get("/my-request", authMiddleware, getMyRetestRequest);
router.get("/my-request/:candidateId", getMyRetestRequest); // Alternative route without auth

module.exports = router;

