const mongoose = require("mongoose");

const recordingSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recording", recordingSchema);
