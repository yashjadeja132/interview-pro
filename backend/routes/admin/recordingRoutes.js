const express = require("express");
const router = express.Router();
const { saveRecording } = require("../../controllers/admin/recordingController");
const uploadRecording = require('../../middleware/uploadRecording')

router.post("/save",uploadRecording.single(''), saveRecording);

module.exports = router;
