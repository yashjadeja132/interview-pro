const mongoose = require("mongoose");

const RetestRequestSchema = new mongoose.Schema({
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
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date, 
    default: null 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  reason: { 
    type: String, 
    default: null 
  }
}, { timestamps: true });

// Index for efficient querying
RetestRequestSchema.index({ candidateId: 1, status: 1 });
RetestRequestSchema.index({ status: 1 });

module.exports = mongoose.model("RetestRequest", RetestRequestSchema);

