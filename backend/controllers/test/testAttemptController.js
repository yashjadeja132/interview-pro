const TestAttempt = require("../../models/TestAttempt");
const TestResult = require("../../models/Test");
const Question = require("../../models/Question");
const Candidate = require("../../models/Candidate");
const RetestRequest = require("../../models/RetestRequest");
const { sendResultMail } = require('../../services/resultMailService');

// Create a new test attempt
exports.createTestAttempt = async (req, res) => {
  try {
    const { candidateId, positionId } = req.body;
    
    console.log('CREATE TEST ATTEMPT - Request body:', req.body);
    console.log(' CREATE TEST ATTEMPT - Required fields check:', {
      candidateId: !!candidateId,
      positionId: !!positionId
    });

    if (!candidateId || !positionId) {
      console.log('❌ CREATE TEST ATTEMPT - Missing required fields');
      return res.status(400).json({ message: "Candidate ID and Position ID are required" });
    }

    // Check if candidate exists
    const candidate = await Candidate.findById(candidateId).populate('position');
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if position exists
    const Position = require("../../models/Position");
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Check if candidate has already completed a test attempt
    const completedAttempt = await TestAttempt.findOne({
      candidateId,
      positionId,
      status: 'completed'
    });

    // If candidate has completed a test, check for approved retest request
    if (completedAttempt) {
      const retestRequest = await RetestRequest.findOne({
        candidateId,
        positionId,
        status: 'approved'
      }).sort({ createdAt: -1 });

      if (!retestRequest) {
        // Check if there's a pending request
        const pendingRequest = await RetestRequest.findOne({
          candidateId,
          positionId,
          status: 'pending'
        });

        if (pendingRequest) {
          return res.status(403).json({
            message: "You have already completed a test. Your retest request is pending approval. Please wait for admin/HR to approve your request before taking the test again.",
            hasPendingRequest: true
          });
        }

        // No retest request at all
        return res.status(403).json({
          message: "You have already completed a test. Please request a retest from admin/HR to take the test again.",
          requiresRetestRequest: true
        });
      }

      // If approved, mark the retest request as used (optional - you might want to keep it for history)
      // For now, we'll just allow them to proceed
      console.log('✅ Candidate has approved retest request, allowing test attempt');
    }

    // Get the next attempt number for this candidate-position combination
    const lastAttempt = await TestAttempt.findOne(
      { candidateId, positionId },
      {},
      { sort: { attemptNumber: -1 } }
    );

    const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Mark previous attempts as not latest
    await TestAttempt.updateMany(
      { candidateId, positionId, isLatest: true },
      { isLatest: false }
    );

    // Create new test attempt
    const testAttempt = new TestAttempt({
      candidateId,
      positionId,
      attemptNumber: nextAttemptNumber,
      status: 'in_progress',
      isLatest: true
    });

    await testAttempt.save();
console.log('testAttempt',testAttempt)
    res.status(201).json({
      message: "Test attempt created successfully",
      data: {
        attemptId: testAttempt._id,
        attemptNumber: testAttempt.attemptNumber,
        candidateId: testAttempt.candidateId,
        positionId: testAttempt.positionId,
        status: testAttempt.status,
        startedAt: testAttempt.startedAt
      }
    });

  } catch (error) {
    console.error("Error creating test attempt:", error);
    res.status(500).json({ message: "Failed to create test attempt", error: error.message });
  }
};

// Submit test with attempt tracking
exports.submitTestWithAttempt = async (req, res) => {
  try {
    const { candidateId, positionId, attemptId, timeTakenInSeconds, timeTakenFormatted } = req.body;
    const candidateRecording = req.file ? `${process.env.UploadLink}/candidateVideo/${req.file.filename}` : 'no video';
    const answers = JSON.parse(req.body.answers);

    // Validate attempt
    const testAttempt = await TestAttempt.findById(attemptId);
    if (!testAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    if (testAttempt.candidateId.toString() !== candidateId || 
        testAttempt.positionId.toString() !== positionId) {
      return res.status(400).json({ message: "Invalid attempt for this candidate-position combination" });
    }

    if (testAttempt.status === 'completed') {
      return res.status(400).json({ message: "Test attempt already completed" });
    }

    const candidate = await Candidate.findById(candidateId).populate('position');
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const questions = await Question.find({ position: positionId });
    if (questions.length === 0) {
      return res.status(400).json({ message: "No questions found for this position" });
    }

    let correctCount = 0;
    const detailedAnswers = questions.map((q) => {
      const candidateAnswer = answers.find(a => a.questionId === q._id.toString());
      const correctOption = q.options.find(opt => opt.isCorrect);
      let isCorrect = false;
      let selectedOptionImage = "";
      let correctOptionImage = "";
      let selectedOptionText = "";
      let status = 0;

      if (candidateAnswer) {
        const selectedOptObj = q.options.find(opt => opt._id.toString() === candidateAnswer.selectedOption);
        selectedOptionText = selectedOptObj ? selectedOptObj.optionText : "";
        selectedOptionImage = selectedOptObj ? selectedOptObj.optionImage : "";
        correctOptionImage = correctOption ? correctOption.optionImage : "";
        status = candidateAnswer.status || 0;

        if (correctOption && candidateAnswer.selectedOption === correctOption._id.toString()) {
          isCorrect = true;
          correctCount++;
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
        status
      };
    });

    const score = (correctCount / questions.length) * 100;

    // Save TestResult with attempt tracking
    const testResult = new TestResult({
      candidateId,
      positionId,
      attemptNumber: testAttempt.attemptNumber,
      testAttemptId: testAttempt._id,
      answers: detailedAnswers,
      score,
      videoPath: candidateRecording,
      totalQuestions: questions.length,
      timeTakenInSeconds: timeTakenInSeconds || 0,
      timeTakenFormatted: timeTakenFormatted || "",
      isSubmitted: 1
    });

    await testResult.save();

    // Update test attempt status
    testAttempt.status = 'completed';
    testAttempt.testResultId = testResult._id;
    testAttempt.completedAt = new Date();
    await testAttempt.save();
    
    // Update candidate with isSubmitted flag
    await Candidate.findByIdAndUpdate(candidateId, { isSubmitted: 1 });

    // Send result email
    try {
      await sendResultMail(candidate.email, {
        score,
        totalQuestions: questions.length,
        correctCount,
        candidateName: candidate.name,
        positionName: candidate.position?.name || 'N/A',
        candidateId: candidate._id,
        attemptNumber: testAttempt.attemptNumber
      });
      console.log(`📧 Result email sent to ${candidate.email} for attempt ${testAttempt.attemptNumber}`);
    } catch (emailErr) {
      console.error("⚠️ Failed to send result email:", emailErr.message);
    }

    res.json({
      message: "Test submitted successfully",
      data: {
        score,
        totalQuestions: questions.length,
        attemptNumber: testAttempt.attemptNumber,
        testResultId: testResult._id
      }
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Failed to submit test", error: error.message });
  }
};

// Get all attempts for a candidate-position combination
exports.getCandidateAttempts = async (req, res) => {
  try {
    const { candidateId, positionId } = req.params;

    const attempts = await TestAttempt.find({ candidateId, positionId })
      .populate('testResultId', 'score totalQuestions createdAt')
      .sort({ attemptNumber: -1 });

    const formattedAttempts = attempts.map(attempt => ({
      attemptId: attempt._id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      isLatest: attempt.isLatest,
      result: attempt.testResultId ? {
        score: attempt.testResultId.score,
        totalQuestions: attempt.testResultId.totalQuestions,
        submittedAt: attempt.testResultId.createdAt
      } : null
    }));

    res.status(200).json({
      message: "Attempts retrieved successfully",
      data: formattedAttempts
    });

  } catch (error) {
    console.error("Error fetching attempts:", error);
    res.status(500).json({ message: "Failed to fetch attempts", error: error.message });
  }
};

// Get latest attempt for a candidate-position combination
exports.getLatestAttempt = async (req, res) => {
  try {
    const { candidateId, positionId } = req.params;

    const latestAttempt = await TestAttempt.findOne({ 
      candidateId, 
      positionId, 
      isLatest: true 
    });

    if (!latestAttempt) {
      return res.status(404).json({ message: "No attempts found for this candidate-position combination" });
    }

    res.status(200).json({
      message: "Latest attempt retrieved successfully",
      data: {
        attemptId: latestAttempt._id,
        attemptNumber: latestAttempt.attemptNumber,
        status: latestAttempt.status,
        startedAt: latestAttempt.startedAt,
        completedAt: latestAttempt.completedAt
      }
    });

  } catch (error) {
    console.error("Error fetching latest attempt:", error);
    res.status(500).json({ message: "Failed to fetch latest attempt", error: error.message });
  }
};

// Get all test results with attempt information
exports.getAllResultsWithAttempts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      position,
      minScore,
      maxScore,
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;
    const match = {};

    // Score filter
    if (minScore || maxScore) {
      match.score = {};
      if (minScore) match.score.$gte = Number(minScore);
      if (maxScore) match.score.$lte = Number(maxScore);
    }

    // Date range filter
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Build pipeline with attempt information
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
      {
        $lookup: {
          from: "testattempts",
          localField: "testAttemptId",
          foreignField: "_id",
          as: "attempt",
        },
      },
      { $unwind: "$attempt" },
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
      positionName: result.position.name,
      score: result.score,
      video: result.videoPath,
      timeTakenFormatted: result.timeTakenFormatted,
      attemptNumber: result.attemptNumber,
      attemptStatus: result.attempt.status,
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
