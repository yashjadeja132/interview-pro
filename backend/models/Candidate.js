const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password :{type:String},
  phone: { type: String},
  experience: { type: String, required: true },
   schedule: { type: Date },
  technicalQuestions: { type: Number }, // Number of technical questions
  logicalQuestions: { type: Number }, // Number of logical question
  timeforTest:{type:Number},
  position: { type: mongoose.Schema.Types.ObjectId, ref:'Position' ,required: true }, // job role applied for
  questionsAskedToCandidate: { type: Number }, // Number of questions to ask the candidate
  isSubmitted: { type: Number, default: 0 }, // 0 = not submitted, 1 = submitted
}, { timestamps: true });

module.exports = mongoose.model("Candidate", CandidateSchema);
