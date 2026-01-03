const mongoose = require("mongoose");

const CandidateTestProgressSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
  // attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "TestAttempt" },
  // attemptNumber: { type: Number, default: 1 },
  progress: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      question: { type: String },
      options: [
        {
          optionId: { type: String },
          optionText: { type: String }
        }
      ],
      selectedOption: { type: String, default: null },
      selectedOptionText: { type: String, default: null },
      status: { type: Number, default: 0 }
    }
  ],
  currentQuestionIndex: { type: Number, default: 0 },
  timeLeft: { type: Number, default: 0 },
  lastSavedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique progress per candidate-position combination
CandidateTestProgressSchema.index({ candidateId: 1, positionId: 1 }, { unique: true });

module.exports = mongoose.model("CandidateTestProgress", CandidateTestProgressSchema);
