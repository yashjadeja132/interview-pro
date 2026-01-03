const Question = require("../../models/Question");
const Position = require("../../models/Position");
const Candidate = require("../../models/Candidate");
const { default: mongoose } = require("mongoose");
// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { positionId, questionText, options, category } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;
    // Parse category as number if provided (FormData sends as string)
    const categoryNumber = category ? Number(category) : undefined;
    let questionImageUrl = null;
    if (req.files && req.files['questionImage']) {
      const fileName  = req.files['questionImage'][0].filename;
      questionImageUrl=`${process.env.UploadLink}/questions/${fileName}`;
    }
    console.log(questionImageUrl)
    // Handle option images
    if (req.files && req.files['optionImages']) {
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          const fileName = file.filename
          parsedOptions[index].optionImage = `${process.env.UploadLink}/questions/${fileName}`;
        }
      });
    }

    // Validate position
    const position = await Position.findById(positionId);
    if (!position) return res.status(404).json({ message: "Position not found" });

    const question = new Question({
      position: positionId,
      category: categoryNumber, // Optional category flag (1, 2, or 3)
      questionText,
      questionImage: questionImageUrl,
      options: parsedOptions
    });
// console.log(question)
// return
    await question.save();
    console.log('question is saved')
    res.status(201).json({ message: "Question created successfully", question });
  } catch (err) {
    console.log(err.message)
     if (err.code === 11000 && err.keyPattern && err.keyPattern.questionText) {
    return res.status(400).json({ message: "Duplicate question text. Please use a different question." });
  }
    res.status(500).json({ message: err.message });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  console.log('hii')
  try {
    const questions = await Question.find().populate("position", "name");
const formattedQuestions = questions.map(q => ({
  _id: q._id || 'no',
  positionId: q.position?._id || 'no Id',
  position: q.position?.name || 'No Position',
  category: q.category || null,
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
    const { questionText, options, positionId, category } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (positionId) {
      const position = await Position.findById(positionId);
      if (!position) return res.status(404).json({ message: "Position not found" });
      question.position = positionId;
    }

    if (questionText) question.questionText = questionText;
    if (category !== undefined) {
      // Parse category as number if provided (FormData sends as string)
      question.category = category ? Number(category) : undefined; // Allow setting to undefined to clear category
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

// Get questions by position (for admin panel)
exports.getQuestionsByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const questions = await Question.find({ position: positionId })
      .populate("position", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch random questions by position (for candidate quiz)
exports.getRandomQuestionsByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const candidateId = req.query.candidateId || (req.user && req.user.id) || null;
    const count = req.query.count ? parseInt(req.query.count) : (req.params.count ? parseInt(req.params.count) : 20);
    
    let technicalQuestionsCount = null;
    let logicalQuestionsCount = null;
    
    // If candidateId is provided, fetch candidate's question preferences
    if (candidateId) {
      const candidate = await Candidate.findById(candidateId);
      if (candidate) {
        technicalQuestionsCount = candidate.technicalQuestions;
        logicalQuestionsCount = candidate.logicalQuestions;
      }
    }
    
    let technicalQuestions = [];
    let logicalQuestions = [];
    
    // Fetch technical questions first (category doesn't exist)
    if (technicalQuestionsCount !== null && technicalQuestionsCount > 0) {
      const technicalQuestionsList = await Question.aggregate([
        { 
          $match: { 
            position: new mongoose.Types.ObjectId(positionId),
            category: { $exists: false } // Technical questions don't have category
          } 
        },
        { $sample: { size: technicalQuestionsCount } },
        {
          $lookup: {
            from: "positions",
            localField: "position",
            foreignField: "_id",
            as: "position"
          }
        },
        { $unwind: "$position" }
      ]);
      technicalQuestions = technicalQuestionsList;
    }
    
    // Fetch logical/non-technical questions (category exists)
    if (logicalQuestionsCount !== null && logicalQuestionsCount > 0) {
      const logicalQuestionsList = await Question.aggregate([
        { 
          $match: { 
            position: new mongoose.Types.ObjectId(positionId),
            category: { $exists: true } // Logical questions have category
          } 
        },
        { $sample: { size: logicalQuestionsCount } },
        {
          $lookup: {
            from: "positions",
            localField: "position",
            foreignField: "_id",
            as: "position"
          }
        },
        { $unwind: "$position" }
      ]);
      logicalQuestions = logicalQuestionsList;
    }
    
    // If no candidate preferences, use default random sampling
    if (technicalQuestionsCount === null && logicalQuestionsCount === null) {
      const questions = await Question.aggregate([
        { $match: { position: new mongoose.Types.ObjectId(positionId) } },
        { $sample: { size: count } },
        {
          $lookup: {
            from: "positions",
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

      return res.status(200).json(cleanedQuestions);
    }
    
    // Combine questions: technical first, then logical
    const allQuestions = [...technicalQuestions, ...logicalQuestions];
    
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: "No questions found for this position." });
    }
    
    // Remove unwanted fields and shuffle options
    const cleanedQuestions = allQuestions.map(q => {
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
