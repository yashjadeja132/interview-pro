const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: { type: String },
  optionImage: { type: String },
  isCorrect: { type: Boolean, required: true }
},
//  { _id: false }
);

const questionSchema = new mongoose.Schema({
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  category: { type: Number }, // Optional category flag: 1=Quantitative & Aptitude, 2=Verbal & Language Skills, 3=Programming Logic
  questionText: { type: String },
  questionImage: { type: String },
  options: {
    type: [optionSchema],
    validate: {
      validator: function (val) {
        return val.length >= 2; // At least 2 options
      },
      message: 'A question must have at least 2 options.'
    }
  }
}, { timestamps: true });

// ✅ Custom validation: Require either questionText or questionImage
questionSchema.pre('validate', function (next) {
  if (!this.questionText && !this.questionImage) {
    return next(new Error('Question must have either text or image.'));
  }

  for (let opt of this.options) {
    if (!opt.optionText && !opt.optionImage) {
      return next(new Error('Each option must have either text or image.'));
    }
  }

  next();
});

module.exports = mongoose.model('Question', questionSchema);
