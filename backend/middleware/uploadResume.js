// middlewares/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resume"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadResume = multer({ storage });

module.exports = uploadResume;
