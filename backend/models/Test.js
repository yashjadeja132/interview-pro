const mongoose = require("mongoose");

const TestResultSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: "Position", required: true },
  // testAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "TestAttempt", default: null },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      question: { type: String },
       questionImage: { type: String },
      selectedOption: { type: String }, // or option ID
      selectedOptionText: { type: String },
      selectedOptionImage: { type: String }, 
      correctOption: { type: String },
      correctOptionText: { type: String },
          correctOptionImage: { type: String }, 
      isCorrect: { type: Boolean },
      status: { type: Number, default: 0 } // <-- 0=untouched,1=answered,2=visited
    }
  ],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  videoPath: { type: String },
  timeTakenInSeconds: {
    type: Number,
    required: false,
    default: 0
  },
  timeTakenFormatted: {
    type: String, // e.g., "12:45"
    required: false
  },
  attemptNumber: { type: Number, default: 1 },
  isSubmitted: { type: Number, default: 0 }, // 0 = not submitted, 1 = submitted
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TestResult", TestResultSchema);
