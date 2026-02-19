const Question = require("../../models/Question");
const Position = require("../../models/Position");
const Candidate = require("../../models/Candidate");
const Subject = require("../../models/Subject");
const { default: mongoose } = require("mongoose");

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { subjectId, questionText, options } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;
    
    let questionImageUrl = null;
    if (req.files && req.files['questionImage']) {
      const fileName  = req.files['questionImage'][0].filename;
      questionImageUrl=`${process.env.UploadLink}/questions/${fileName}`;
    }
    console.log('questionImageUrl is ',questionImageUrl)

    // Handle option images
    if (req.files && req.files['optionImages']) {
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          const fileName = file.filename
          parsedOptions[index].optionImage = `${process.env.UploadLink}/questions/${fileName}`;
        }
      });
    }

    // Validate subject
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Check for duplicate question with same subject using normalized text
    const normalizedText = questionText ? questionText.trim().toLowerCase() : null;
    if (normalizedText) {
      const existingQuestion = await Question.findOne({ subject: subjectId, normalizedQuestionText: normalizedText });
      if (existingQuestion) {
        return res.status(400).json({ message: "Question with same subject and text already exists" });
      }
    }

    const question = new Question({
      subject: subjectId,
      questionText,
      questionImage: questionImageUrl,
      options: parsedOptions
    });

    await question.save();
    console.log('question is saved')
    res.status(201).json({ message: "Question created successfully", question });
  } catch (err) {
    console.log(err.message)
     if (err.code === 11000 && err.keyPattern && (err.keyPattern.normalizedQuestionText || err.keyPattern.questionText)) {
    return res.status(400).json({ message: "Duplicate question text. Please use a different question." });
  }
    res.status(500).json({ message: err.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, subjectId } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      question.subject = subjectId;
    }

    if (questionText) {
      const normalizedText = questionText.trim().toLowerCase();
      // Check for duplicate within same subject excluding current question
      const duplicate = await Question.findOne({ subject: question.subject, normalizedQuestionText: normalizedText, _id: { $ne: question._id } });
      if (duplicate) return res.status(400).json({ message: "Another question with same subject and text already exists" });
      question.questionText = questionText;
    }

    // Handle question image update
    if (req.files && req.files['questionImage']) {
      const fileName = req.files['questionImage'][0].filename;
      question.questionImage = `${process.env.UploadLink}/questions/${fileName}`;
    }

    // Handle option images update
    if (req.files && req.files['optionImages']) {
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          const fileName = file.filename;
          parsedOptions[index].optionImage = `${process.env.UploadLink}/questions/${fileName}`;
        }
      });
    }

    if (parsedOptions) question.options = parsedOptions;

    await question.save();
    res.status(200).json({ message: "Question updated successfully", question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("subject", "name");
    const formattedQuestions = questions.map(q => ({
      _id: q._id || 'no',
      subjectId: q.subject?._id || 'no Id',
      subject: q.subject?.name || 'No Subject',
      questionText: q.questionText,
      options: q.options,
    }));
    res.status(200).json(formattedQuestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("subject", "name");
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get questions by subject
exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const questions = await Question.find({ subject: subjectId })
      .populate("subject", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch random questions by subject (for candidate quiz)
exports.getRandomQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const count = req.query.count ? parseInt(req.query.count) : 20;

    const questions = await Question.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(subjectId) } },
      { $sample: { size: count } },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject"
        }
      },
      { $unwind: "$subject" }
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this subject." });
    }

    // Remove unwanted fields and shuffle options
    const cleanedQuestions = questions.map(q => {
      const { createdAt, updatedAt, __v, ...subjectData } = q.subject;
      const { createdAt: qCreated, updatedAt: qUpdated, __v: qV, ...questionData } = q;

      return {
        ...questionData,
        subject: subjectData,
        options: q.options.sort(() => Math.random() - 0.5) // shuffle options
      };
    });

    res.status(200).json(cleanedQuestions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
