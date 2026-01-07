// backend/middleware/candidateVideo.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/candidateVideo directory exists (inside backend folder)
const uploadDir = path.join(__dirname, "../uploads/candidateVideo");
if (!fs.existsSync(uploadDir)) {
  console.log("uploads/candidateVideo directory does not exist, creating it");
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("uploads/candidateVideo directory already exists");
}

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const CandidateVid = multer({ storage });

module.exports = CandidateVid;
