const Question = require("../../models/Question");
const Position = require("../../models/Position");
const { default: mongoose } = require("mongoose");
// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { positionId, questionText, options } = req.body;

    // ✅ Parse options (because options may come as JSON string if images are uploaded)
    let parsedOptions = [];
    if (typeof options === "string") {
      parsedOptions = JSON.parse(options);
    } else {
      parsedOptions = options;
    }

    // ✅ Handle uploaded images
    if (req.files['questionImage']) {
      req.body.questionImage = req.files['questionImage'][0].path;
    }

    if (req.files['optionImages']) {
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          parsedOptions[index].optionImage = file.path;
        }
      });
    }

    // Validate position
    const position = await Position.findById(positionId);
    if (!position) return res.status(404).json({ message: "Position not found" });

    const question = new Question({
      position: positionId,
      questionText,
      questionImage: req.body.questionImage || null,
      options: parsedOptions
    });

    await question.save();
    res.status(201).json({ message: "Question created successfully", question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("position", "name");
    const formattedQuestions = questions.map(q => ({
      _id: q._id,
      positionId:q.position._id,
      position: q.position.name, 
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
    const question = await Question.findById(req.params.id).populate("position", "name");
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, positionId } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (positionId) {
      const position = await Position.findById(positionId);
      if (!position) return res.status(404).json({ message: "Position not found" });
      question.position = positionId;
    }

    if (questionText) question.questionText = questionText;
    if (options) question.options = options;

    await question.save();
    res.status(200).json({ message: "Question updated successfully", question });
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

// Fetch random questions by position (for candidate quiz)
exports.getRandomQuestionsByPosition = async (req, res) => {
  try {
    const { positionId, count } = req.params;

    const questions = await Question.aggregate([
      { $match: { position: new mongoose.Types.ObjectId(positionId) } },
      { $sample: { size: parseInt(count) ||10 } },
      {
        $lookup: {
          from: "positions", // collection name
          localField: "position",
          foreignField: "_id",
          as: "position"
        }
      },
      { $unwind: "$position" }
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this position." });
    }

    // Remove unwanted fields and shuffle options
    const cleanedQuestions = questions.map(q => {
      const { createdAt, updatedAt, __v, ...positionData } = q.position;
      const { createdAt: qCreated, updatedAt: qUpdated, __v: qV, ...questionData } = q;

      return {
        ...questionData,
        position: positionData,
        options: q.options.sort(() => Math.random() - 0.5) // shuffle options
      };
    });

    res.status(200).json(cleanedQuestions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
