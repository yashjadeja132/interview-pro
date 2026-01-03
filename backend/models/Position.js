const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  name: { type: String, required: true,  unique: true,  trim: true},
  description: { type: String},
}, { timestamps: true });

module.exports = mongoose.model("Position", positionSchema);
