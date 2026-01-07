// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads/hrImages directory exists (inside backend folder)
const uploadDir = path.join(__dirname, "../uploads/hrImages");
if (!fs.existsSync(uploadDir)) {
  console.log("uploads/hrImages directory does not exist, creating it");
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("uploads/hrImages directory already exists");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

module.exports = multer({ storage });
