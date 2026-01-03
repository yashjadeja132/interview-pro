const mongoose = require("mongoose");

const TestAttemptSchema = new mongoose.Schema({
  candidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Candidate", 
    required: true 
  },
  positionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Position", 
    required: true 
  },
  attemptNumber: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned'], 
    default: 'in_progress' 
  },
  testResultId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TestResult", 
    default: null 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date, 
    default: null 
  },
  // Track if this attempt is the latest for this candidate-position combination
  isLatest: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Compound index to ensure unique attempt numbers per candidate-position
TestAttemptSchema.index({ candidateId: 1, positionId: 1, attemptNumber: 1 }, { unique: true });

// Index for efficient querying of latest attempts
TestAttemptSchema.index({ candidateId: 1, positionId: 1, isLatest: 1 });

module.exports = mongoose.model("TestAttempt", TestAttemptSchema);
