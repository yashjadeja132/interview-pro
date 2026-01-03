const express = require("express");
const router = express.Router();
const candidateController = require("../../controllers/hr/candidateController");
const uploadResume = require("../../middleware/uploadResume"); // multer setup
const {verifySchedule}=require('../../middleware/verifySchedule')
const sendEmail = require('../../utils/sendmail')
const jwt =require('jsonwebtoken')

// CRUD routes
// router.post('/',uploadResume.single('resume'),candidateController.createCandidate)
router.post('/',candidateController.createCandidate)
router.get("/verify", verifySchedule, (req, res) => {
  return res.json({ message: "Access granted", user: req.user });
});
router.get("/", candidateController.getCandidates);
router.delete("/bulk", candidateController.bulkDeleteCandidates);
router.get("/:id", candidateController.getCandidateById);
router.put("/:id", uploadResume.single("resume"), candidateController.updateCandidate);
router.delete("/:id", candidateController.deleteCandidate);

//Email route
router.post("/sendemail", async (req, res) => {
  const { to } = req.body;
  const baseUrl = `${process.env.FrontendUrl}/candidate/interview`;
  console.log(to)
  // generate JWT token valid for 15 mins
  const token = jwt.sign({ email: to }, process.env.JWT_SECRET, { expiresIn: "15m" });

  const link = `${baseUrl}/${token}`;
  const html = `
    <p>Hi,</p>
    <p>Please register using the following link (valid for 15 minutes):</p>
    <a href="${link}">${link}</a>
  `;
  console.log('link send',link)
  try {
    await sendEmail({ to, subject: "Complete your registration", html });
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
