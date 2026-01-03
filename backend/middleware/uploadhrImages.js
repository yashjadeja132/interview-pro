// middleware/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/hrImages"); // make sure "uploads" folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

module.exports = multer({ storage });
