const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists (inside backend folder)
const uploadDir = path.join(__dirname, "../uploads");


if (!fs.existsSync(uploadDir)) {
  console.log("uploads directory does not exist, creating it");
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log("uploads directory already exists");
}

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Add timestamp to prevent duplicate file names
    cb(null, Date.now() + "_" + file.originalname);
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) { // only allow audio files
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
