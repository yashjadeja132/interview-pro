const TestResult = require("../../models/Test");
const Question = require("../../models/Question");
const Candidate = require("../../models/Candidate");
const RetestRequest = require("../../models/RetestRequest");
const { sendResultMail } = require('../../services/resultMailService');
const mongoose = require("mongoose");
exports.submitTest = async (req, res) => {
  try {
    const { candidateId, positionId, timeTakenInSeconds, timeTakenFormatted } = req.body;
    console.log('time taken in seconds:', timeTakenInSeconds)
    console.log('time taken formatted:', timeTakenFormatted)
    const candidateRecording = req.file ? `${process.env.UploadLink}/candidateVideo/${req.file.filename}` : 'no video'
    const lastAttempt = await TestResult.find({ candidateId, positionId })
      .sort({ attemptNumber: -1 })
      .limit(1);
    const nextAttempt = lastAttempt.length > 0 ? lastAttempt[0].attemptNumber + 1 : 1;
    const answers = JSON.parse(req.body.answers)
    const questionIds = answers.map(a => a.questionId);
    const candidate = await Candidate.findById(candidateId).populate('position');
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    const questions = await Question.find({ position: positionId, _id: { $in: questionIds } });
    if (questions.length === 0)
      return res.status(400).json({ message: "No questions found for this position" });
    let correctCount = 0;
    let incorrectCount = 0;
    const detailedAnswers = questions.map((q) => {
      const candidateAnswer = answers.find(a => a.questionId === q._id.toString());
      const correctOption = q.options.find(opt => opt.isCorrect);
      let isCorrect = false;
      let selectedOptionImage = "";
      let correctOptionImage = "";
      let selectedOptionText = "";
      let status = 0;
      let marksObtained = 0; // Initialize marks for this question

      if (candidateAnswer) {
        const selectedOptObj = q.options.find(opt => opt._id.toString() === candidateAnswer.selectedOption);
        selectedOptionText = selectedOptObj ? selectedOptObj.optionText : "";
        selectedOptionImage = selectedOptObj ? selectedOptObj.optionImage : "";
        correctOptionImage = correctOption ? correctOption.optionImage : "";
        status = candidateAnswer.status || 0;

        if (correctOption && candidateAnswer.selectedOption === correctOption._id.toString()) {
          isCorrect = true;
          correctCount++;
          marksObtained = 1; // Full marks for correct answer
        } else if (candidateAnswer.selectedOption) {
          incorrectCount++;
          marksObtained = candidate.isNagativeMarking ? -candidate.negativeMarkingValue : 0; // Negative marks for incorrect answer
        }
      }

      return {
        questionId: q._id,
        question: q.questionText,
        questionImage: q.questionImage || null,
        selectedOption: candidateAnswer ? candidateAnswer.selectedOption : null,
        selectedOptionText,
        selectedOptionImage,
        correctOption: correctOption ? correctOption._id : null,
        correctOptionText: correctOption ? correctOption.optionText : null,
        correctOptionImage,
        isCorrect,
        status,
        marksObtained // Include marks obtained for this question
      };
    });

    // Calculate total marks obtained
    const totalMarks = detailedAnswers.reduce((sum, answer) => sum + answer.marksObtained, 0);
    console.log('Total Marks Obtained:', totalMarks);
    const marksPerQuestion = questions[0]?.marks ?? 1;

    // Calculate score as percentage
    const score = (totalMarks / (candidate.questionsAskedToCandidate * marksPerQuestion)) * 100;
    console.log('candidate.questionsAskedToCandidate:', candidate.questionsAskedToCandidate);
    console.log('marks per question:', marksPerQuestion);
    console.log('Percentage Score:', score);
    // return 0;
        console.log("🧾 --- TEST SUMMARY ---");
     console.log('correctCount:', correctCount);
     console.log('incorrectCount:', incorrectCount);
     console.log('totalMarks:', totalMarks);
     console.log('score (percentage):', score.toFixed(2) + '%');
     console.log("🧾 --- END OF SUMMARY ---");
    const testResult = new TestResult({
      candidateId,
      positionId,
      answers: detailedAnswers,
      score, // Save percentage score
      videoPath: candidateRecording,
      totalQuestions: candidate.questionsAskedToCandidate,
      totalMarks, // Save total marks in the result
      marksObtained: totalMarks, // Save total marks in marksObtained field
      timeTakenInSeconds: timeTakenInSeconds || 0,
      timeTakenFormatted: timeTakenFormatted || "",
      correctCount,
      incorrectCount,
      totalMarks,
      score,
      attemptNumber: nextAttempt,
      isSubmitted: 1
    });

    await testResult.save();

    // Update candidate with isSubmitted flag
    await Candidate.findByIdAndUpdate(candidateId, { isSubmitted: 1 });

    // Create retest request record when candidate submits test
    try {
      const existingRequest = await RetestRequest.findOne({
        candidateId,
        positionId,
        status: 'pending'
      });

      if (!existingRequest) {
        const retestRequest = new RetestRequest({
          candidateId,
          positionId,
          status: 'pending'
        });
        await retestRequest.save();
        console.log(`Retest request created `);
      } else {
        console.log(`Pending retest request already exists for candidate ${candidateId} and position ${positionId}`);
      }
    } catch (retestErr) {
      console.error("⚠️ Failed to create retest request:", retestErr.message);
      // Don't fail the test submission if retest request creation fails
    }

    try {
      await sendResultMail(candidate.email, {
        score, // Send percentage score
        totalMarks, // Send total marks obtained
        totalQuestions: questions.length,
        correctCount,
        candidateName: candidate.name,
        positionName: candidate.position?.name || 'N/A',
        candidateId: candidate._id
      });
      console.log(`Result email sent to ${candidate.email}`);
    } catch (emailErr) {
      console.error("⚠️ Failed to send result email:", emailErr.message);
    }

    res.json({ message: "Test submitted successfully", score, totalMarks, totalQuestions: questions.length });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Failed to submit test", error: error.message });
  }
}
// controllers/testController.js
exports.getAllResults = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      position,
      minScore,maxScore,startDate,endDate,} = req.query;
    const skip = (page - 1) * limit;
    const match = {};

    if (minScore || maxScore) {
      match.score = {};
      if (minScore) match.score.$gte = Number(minScore);
      if (maxScore) match.score.$lte = Number(maxScore);
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Position filter
    if (position) {
      match["position.name"] = position;
    }

    // Build pipeline
    const pipeline = [
      {
        $lookup: {
          from: "candidates",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidate",
        },
      },
      { $unwind: "$candidate" },
      {
        $lookup: {
          from: "positions",
          localField: "positionId",
          foreignField: "_id",
          as: "position",
        },
      },
      { $unwind: "$position" },
      { $match: match },
    ];

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "candidate.name": { $regex: search, $options: "i" } },
            { "candidate.email": { $regex: search, $options: "i" } },
            { "position.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Position filter
    if (position) {
      pipeline.push({
        $match: { "position.name": { $regex: position, $options: "i" } },
      });
    }

    // Sort, skip, limit
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    const results = await TestResult.aggregate(pipeline);

    // Get total count
    const countPipeline = pipeline.slice(0, -2);
    countPipeline.push({ $count: "count" });
    const totalResult = await TestResult.aggregate(countPipeline);
    const total = totalResult[0]?.count || 0;
    const simplifiedResults = results.map((result) => ({
      candidateId: result.candidateId,
      candidateName: result.candidate.name,
      candidateEmail: result.candidate.email,
      attemptNumber: result.attemptNumber,
      positionName: result.position.name,
      score: result.score,
      questionsAskedToCandidate: result.candidate.questionsAskedToCandidate,
      video: result.videoPath,
      timeTakenFormatted: result.timeTakenFormatted,
      createdAt: result.createdAt,
    }));

    res.status(200).json({
      data: simplifiedResults,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get single candidate's results
exports.getResultByCandidate = async (req, res) => {
  try {
    const results = await TestResult.find({ candidateId: req.params.candidateId }).
    sort({ attemptNumber:1 })
      .populate("candidateId", "name email isNagativeMarking negativeMarkingValue")
      .populate("positionId", "name -_id")
      .sort({ attemptNumber:1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch random questions for candidate (with shuffled options)
exports.getRandomQuestionsByPosition = async (req, res) => {
  try {
    const { positionId, count } = req.query;
    const candidateId = req.query.candidateId || (req.user && req.user.id) || null;
    
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
            position: mongoose.Types.ObjectId(positionId),
            category: { $exists: false } // Technical questions don't have category
          } 
        },
        { $sample: { size: technicalQuestionsCount } }
      ]);
      technicalQuestions = technicalQuestionsList;
    }
    
    // Fetch logical/non-technical questions (category exists)
    if (logicalQuestionsCount !== null && logicalQuestionsCount > 0) {
      const logicalQuestionsList = await Question.aggregate([
        { 
          $match: { 
            position: mongoose.Types.ObjectId(positionId),
            category: { $exists: true } // Logical questions have category
          } 
        },
        { $sample: { size: logicalQuestionsCount } }
      ]);
      logicalQuestions = logicalQuestionsList;
    }
    
    // If no candidate preferences, use default random sampling
    if (technicalQuestionsCount === null && logicalQuestionsCount === null) {
      const questions = await Question.aggregate([
        { $match: { position: mongoose.Types.ObjectId(positionId) } },
        { $sample: { size: parseInt(count) || 10 } }
      ]);

      // Shuffle options for each question
      const shuffledQuestions = questions.map(q => ({
        ...q,
        options: q.options.sort(() => Math.random() - 0.5)
      }));

      return res.status(200).json(shuffledQuestions);
    }
    
    // Combine questions: technical first, then logical
    const allQuestions = [...technicalQuestions, ...logicalQuestions];
    
    // Shuffle options for each question
    const shuffledQuestions = allQuestions.map(q => ({
      ...q,
      options: q.options.sort(() => Math.random() - 0.5)
    }));

    res.status(200).json(shuffledQuestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.id)
      .populate("candidateId", "name email")
      .populate("positionId", "name");

    if (!result) return res.status(404).json({ message: "Result not found" });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
