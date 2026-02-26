const cloudinary = require("../config/config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "questions",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const name = file.originalname.split('.')[0];
      return `${file.fieldname}-${timestamp}-${name}`;
    },
  },
});

const upload = multer({ storage });

module.exports = upload;
