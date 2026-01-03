const express = require("express");
const { registerCandidate, loginCandidate } = require("../../controllers/candidate/authControllers");
const uploadResume = require("../../middleware/uploadResume");
const verifyRegistrationToken = require('../../middleware/authMiddleware')

const router = express.Router();

router.post("/register/:token",uploadResume.single('resume'),verifyRegistrationToken ,registerCandidate);
router.post("/login", loginCandidate);

module.exports = router;
