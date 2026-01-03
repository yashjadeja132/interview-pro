// Attempt Management Controller - Commented Out

const TestAttempt = require("../../models/TestAttempt");
const TestResult = require("../../models/Test");
const Candidate = require("../../models/Candidate");
const Position = require("../../models/Position");
const Question = require("../../models/Question");

// Get all attempts with detailed information for admin
exports.getAllAttemptsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      position,
      status,
      minScore,
      maxScore,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    const skip = (page - 1) * limit;
    const match = {};

    // Status filter
    if (status) {
      match.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Build aggregation pipeline
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
          from: "testresults",
          localField: "testResultId",
          foreignField: "_id",
          as: "result",
        },
      },
      { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
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

    // Score filter (only for completed attempts)
    if (minScore || maxScore) {
      pipeline.push({
        $match: {
          "result.score": {
            $gte: minScore ? Number(minScore) : 0,
            $lte: maxScore ? Number(maxScore) : 100
          }
        }
      });
    }

    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortObj });

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    const attempts = await TestAttempt.aggregate(pipeline);

    // Get total count
    const countPipeline = pipeline.slice(0, -2);
    countPipeline.push({ $count: "count" });
    const totalResult = await TestAttempt.aggregate(countPipeline);
    const total = totalResult[0]?.count || 0;

    // Format response
    const formattedAttempts = attempts.map((attempt) => ({
      attemptId: attempt._id,
      candidateId: attempt.candidateId,
      candidateName: attempt.candidate.name,
      candidateEmail: attempt.candidate.email,
      candidatePhone: attempt.candidate.phone,
      positionId: attempt.positionId,
      positionName: attempt.position.name,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      isLatest: attempt.isLatest,
      result: attempt.result ? {
        score: attempt.result.score,
        totalQuestions: attempt.result.totalQuestions,
        timeTakenFormatted: attempt.result.timeTakenFormatted,
        videoPath: attempt.result.videoPath,
        submittedAt: attempt.result.createdAt
      } : null,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt
    }));

    res.status(200).json({
      data: formattedAttempts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching attempts for admin:", error);
    res.status(500).json({ message: "Failed to fetch attempts", error: error.message });
  }
};

// Get detailed attempt information
exports.getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
      .populate('candidateId', 'name email phone experience')
      .populate('positionId', 'name description')
      .populate('testResultId');

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Get detailed result information if completed
    let detailedResult = null;
    if (attempt.testResultId) {
      detailedResult = await TestResult.findById(attempt.testResultId)
        .populate('answers.questionId');
    }

    res.status(200).json({
      message: "Attempt details retrieved successfully",
      data: {
        attempt: {
          attemptId: attempt._id,
          candidateId: attempt.candidateId._id,
          candidateName: attempt.candidateId.name,
          candidateEmail: attempt.candidateId.email,
          candidatePhone: attempt.candidateId.phone,
          candidateExperience: attempt.candidateId.experience,
          positionId: attempt.positionId._id,
          positionName: attempt.positionId.name,
          positionDescription: attempt.positionId.description,
          attemptNumber: attempt.attemptNumber,
          status: attempt.status,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          isLatest: attempt.isLatest,
          createdAt: attempt.createdAt,
          updatedAt: attempt.updatedAt
        },
        result: detailedResult ? {
          score: detailedResult.score,
          totalQuestions: detailedResult.totalQuestions,
          timeTakenInSeconds: detailedResult.timeTakenInSeconds,
          timeTakenFormatted: detailedResult.timeTakenFormatted,
          videoPath: detailedResult.videoPath,
          submittedAt: detailedResult.createdAt,
          answers: detailedResult.answers.map(answer => ({
            questionId: answer.questionId._id,
            questionText: answer.questionId.questionText,
            questionImage: answer.questionId.questionImage,
            selectedOption: answer.selectedOption,
            selectedOptionText: answer.selectedOptionText,
            selectedOptionImage: answer.selectedOptionImage,
            correctOption: answer.correctOption,
            correctOptionText: answer.correctOptionText,
            correctOptionImage: answer.correctOptionImage,
            isCorrect: answer.isCorrect,
            status: answer.status
          }))
        } : null
      }
    });

  } catch (error) {
    console.error("Error fetching attempt details:", error);
    res.status(500).json({ message: "Failed to fetch attempt details", error: error.message });
  }
};

// Get candidate's all attempts
exports.getCandidateAttempts = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { positionId } = req.query;

    const match = { candidateId };
    if (positionId) {
      match.positionId = positionId;
    }

    const attempts = await TestAttempt.find(match)
      .populate('positionId', 'name')
      .populate('testResultId', 'score totalQuestions timeTakenFormatted createdAt')
      .sort({ attemptNumber: -1 });

    const formattedAttempts = attempts.map(attempt => ({
      attemptId: attempt._id,
      positionId: attempt.positionId._id,
      positionName: attempt.positionId.name,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      isLatest: attempt.isLatest,
      result: attempt.testResultId ? {
        score: attempt.testResultId.score,
        totalQuestions: attempt.testResultId.totalQuestions,
        timeTakenFormatted: attempt.testResultId.timeTakenFormatted,
        submittedAt: attempt.testResultId.createdAt
      } : null
    }));

    res.status(200).json({
      message: "Candidate attempts retrieved successfully",
      data: formattedAttempts
    });

  } catch (error) {
    console.error("Error fetching candidate attempts:", error);
    res.status(500).json({ message: "Failed to fetch candidate attempts", error: error.message });
  }
};

// Get attempt analytics for admin dashboard
exports.getAttemptAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic statistics
    const totalAttempts = await TestAttempt.countDocuments({
      createdAt: { $gte: startDate }
    });

    const completedAttempts = await TestAttempt.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const inProgressAttempts = await TestAttempt.countDocuments({
      status: 'in_progress',
      createdAt: { $gte: startDate }
    });

    const abandonedAttempts = await TestAttempt.countDocuments({
      status: 'abandoned',
      createdAt: { $gte: startDate }
    });

    // Get average score
    const avgScoreResult = await TestResult.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" }
        }
      }
    ]);

    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].averageScore : 0;

    // Get attempts by position
    const attemptsByPosition = await TestAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: "positions",
          localField: "positionId",
          foreignField: "_id",
          as: "position"
        }
      },
      { $unwind: "$position" },
      {
        $group: {
          _id: "$position.name",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily attempts for chart
    const dailyAttempts = await TestAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.status(200).json({
      message: "Analytics retrieved successfully",
      data: {
        summary: {
          totalAttempts,
          completedAttempts,
          inProgressAttempts,
          abandonedAttempts,
          completionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts * 100).toFixed(1) : 0,
          averageScore: Math.round(averageScore)
        },
        attemptsByPosition,
        dailyAttempts: dailyAttempts.map(item => ({
          date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
          total: item.count,
          completed: item.completed
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

// Reset attempt (mark as abandoned and allow new attempt)
exports.resetAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ message: "Cannot reset completed attempt" });
    }

    // Mark attempt as abandoned
    attempt.status = 'abandoned';
    attempt.completedAt = new Date();
    await attempt.save();

    res.status(200).json({
      message: "Attempt reset successfully",
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        resetAt: attempt.completedAt
      }
    });

  } catch (error) {
    console.error("Error resetting attempt:", error);
    res.status(500).json({ message: "Failed to reset attempt", error: error.message });
  }
};

// Delete attempt (admin only)
exports.deleteAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Delete associated test result if exists
    if (attempt.testResultId) {
      await TestResult.findByIdAndDelete(attempt.testResultId);
    }

    // Delete the attempt
    await TestAttempt.findByIdAndDelete(attemptId);

    res.status(200).json({
      message: "Attempt deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting attempt:", error);
    res.status(500).json({ message: "Failed to delete attempt", error: error.message });
  }
};

// Empty exports to prevent errors
module.exports = {};
