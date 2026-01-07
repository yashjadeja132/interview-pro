// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/resume directory exists (inside backend folder)
const uploadDir = path.join(__dirname, "../uploads/resume");
if (!fs.existsSync(uploadDir)) {
  console.log("uploads/resume directory does not exist, creating it");
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("uploads/resume directory already exists");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadResume = multer({ storage });

module.exports = uploadResume;
