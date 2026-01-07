const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/questions directory exists (inside backend folder)
const uploadDir = path.join(__dirname, '../uploads/questions');
if (!fs.existsSync(uploadDir)) {
  console.log('uploads/questions directory does not exist, creating it');
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log('uploads/questions directory already exists');
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Folder for images
  },
  filename: (req, file, cb) => {
   const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  }
});

// File filter (accept only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
