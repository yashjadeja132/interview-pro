const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  name: { type: String, required: true,  unique: true,  trim: true},
  salary: { type: Number, required: true},
  experience: { type: String, required: true},
 vacancies: { type: Number, required: true},
  shift: { type: String, enum: ["Day Shift", "Night Shift"], required: true},
  jobType: { type: String, enum: ["Full-time","Freelancer", "Part-time", "Contract"], required: true},
}, { timestamps: true });

module.exports = mongoose.model("Position", positionSchema);
