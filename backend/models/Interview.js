const mongoose = require('mongoose')

const interviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hr: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  link: { type: String },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  marks: { type: Number }
}, { timestamps: true });

module.exports = mongoose.Model('Interview',interviewSchema)