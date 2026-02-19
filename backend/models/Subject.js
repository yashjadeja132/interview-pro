const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: Number, enum: [1, 2], required: true } // 1=Technical, 2=Non Technical
}, { timestamps: true });

module.exports = mongoose.model("Subject", SubjectSchema);
