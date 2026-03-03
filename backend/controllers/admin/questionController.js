const Question = require("../../models/Question");
const Position = require("../../models/Position");
const Candidate = require("../../models/Candidate");
const Subject = require("../../models/Subject");
const { default: mongoose } = require("mongoose");
const cloudinary = require("../../config/config");

// Helper function to extract public_id from Cloudinary URL
const getPublicId = (url) => {
  if (!url) return null;
  // Cloudinary URL format: .../upload/v{version}/{public_id}.{ext}
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  
  // The public_id starts after the version (v{digits})
  // Usually parts[uploadIndex + 2] if version is present
  const publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
  const publicId = publicIdWithExt.split(".")[0];
  return publicId;
};

// Create a new question
exports.createQuestion = async (req, res) => {
  console.log('req.files is ',req.files)
  try {
    const { subjectId, questionText, options } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;
    console.log('options is ',options)
    let questionImageUrl = null;
    if (req.files && req.files['questionImage']) {
      questionImageUrl = req.files['questionImage'][0].path;
    }
    console.log('questionImageUrl is ',questionImageUrl)

    // Handle option images
    if (req.files && req.files['optionImages']) {
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          parsedOptions[index].optionImage = file.path;
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
        return res.status(400).json({ message: "This question already exists for this subject." });
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
    console.log('error is ',err.message)
    // if (err.code === 11000) {
    //   return res.status(400).json({ message: "This question already exists for this subject." });
    // }
    res.status(500).json({ message: err });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, subjectId } = req.body;
    let parsedOptions = typeof options === "string" ? JSON.parse(options) : options;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (subjectId || questionText) {
      const targetSubject = subjectId || question.subject;
      const targetText = questionText || question.questionText;
      
      if (targetText) {
        const normalizedText = targetText.trim().toLowerCase();
        // Check for duplicate within same subject excluding current question
        const duplicate = await Question.findOne({ 
          subject: targetSubject, 
          normalizedQuestionText: normalizedText, 
          _id: { $ne: question._id } 
        });
        
        if (duplicate) {
          return res.status(400).json({ message: "This question already exists for this subject." });
        }
      }

      if (subjectId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        question.subject = subjectId;
      }
      if (questionText) {
        question.questionText = questionText;
      }
    }

    // Handle question image update
    if (req.files && req.files['questionImage']) {
      // Delete old image from Cloudinary
      if (question.questionImage) {
        const publicId = getPublicId(question.questionImage);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      question.questionImage = req.files['questionImage'][0].path;
    }

    // Handle option images update
    if (req.files && req.files['optionImages']) {
      // Create a map of index to file
      // Multer.fields preserves order but lets be safe with index if provided in some way
      // Actually here we just match by index of the uploaded files to the parsedOptions
      req.files['optionImages'].forEach((file, index) => {
        if (parsedOptions[index]) {
          // Delete old option image if exists
          if (parsedOptions[index].optionImage) {
             const publicId = getPublicId(parsedOptions[index].optionImage);
             if (publicId) cloudinary.uploader.destroy(publicId); // Async but don't strictly need to await all
          }
          parsedOptions[index].optionImage = file.path;
        }
      });
    }

    if (parsedOptions) question.options = parsedOptions;

    await question.save();
    res.status(200).json({ message: "Question updated successfully", question });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This question already exists for this subject." });
    }
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
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Delete images from Cloudinary
    if (question.questionImage) {
      const publicId = getPublicId(question.questionImage);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    for (const opt of question.options) {
      if (opt.optionImage) {
        const publicId = getPublicId(opt.optionImage);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get questions by subject with pagination and search
exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { subject: subjectId };
    if (search) {
      filter.questionText = { $regex: search, $options: 'i' };
    }

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .populate("subject", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
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
