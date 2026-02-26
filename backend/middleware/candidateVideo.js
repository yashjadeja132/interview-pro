const cloudinary = require("../config/config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "candidate_videos",
    resource_type: "video",
    allowed_formats: ["mp4", "webm", "ogg"],
    public_id: (req, file) => Date.now() + "-" + file.originalname.split('.')[0],
  },
});

const CandidateVid = multer({ storage });

module.exports = CandidateVid;
