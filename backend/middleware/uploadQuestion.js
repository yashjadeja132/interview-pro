const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/questions'); // Folder for images
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
