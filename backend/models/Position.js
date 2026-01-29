const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  name: { type: String, required: true,  unique: true,  trim: true},
  salary: { type: Number, required: true},
  freelancer: { type: Boolean, required: true},
  experienced: { type: String, required: true},
  partTime: { type: Boolean, required: true},
  shift: { type: String, required: true},
}, { timestamps: true });

module.exports = mongoose.model("Position", positionSchema);
