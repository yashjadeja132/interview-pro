const RetestRequest = require("../../models/RetestRequest");
const Candidate = require("../../models/Candidate");

// Get all pending retest requests
exports.getPendingRetestRequests = async (req, res) => {
  try {
    const requests = await RetestRequest.find({ status: 'pending' })
      .populate('candidateId', 'name email phone position')
      .populate('positionId', 'name')
      .sort({ requestedAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching retest requests:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// Get all retest requests (pending, approved, rejected)
exports.getAllRetestRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await RetestRequest.find(filter)
      .populate('candidateId', 'name email phone position')
      .populate('positionId', 'name')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching retest requests:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// Approve retest request
exports.approveRetestRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user?.id;

    const retestRequest = await RetestRequest.findById(requestId)
      .populate('candidateId', 'name email')
      .populate('positionId', 'name');

    if (!retestRequest) {
      return res.status(404).json({ 
        success: false,
        message: "Retest request not found" 
      });
    }

    if (retestRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `This request has already been ${retestRequest.status}` 
      });
    }

    retestRequest.status = 'approved';
    retestRequest.reviewedAt = new Date();
    retestRequest.reviewedBy = adminId;

    await retestRequest.save();

    return res.status(200).json({
      success: true,
      message: "Retest request approved successfully",
      request: retestRequest
    });
  } catch (error) {
    console.error('Error approving retest request:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// Reject retest request
exports.rejectRetestRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    const retestRequest = await RetestRequest.findById(requestId)
      .populate('candidateId', 'name email')
      .populate('positionId', 'name');

    if (!retestRequest) {
      return res.status(404).json({ 
        success: false,
        message: "Retest request not found" 
      });
    }

    if (retestRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `This request has already been ${retestRequest.status}` 
      });
    }

    retestRequest.status = 'rejected';
    retestRequest.reviewedAt = new Date();
    retestRequest.reviewedBy = adminId;
    if (reason) {
      retestRequest.reason = reason;
    }

    await retestRequest.save();

    return res.status(200).json({
      success: true,
      message: "Retest request rejected",
      request: retestRequest
    });
  } catch (error) {
    console.error('Error rejecting retest request:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// Get count of pending requests
exports.getPendingCount = async (req, res) => {
  try {
    const count = await RetestRequest.countDocuments({ status: 'pending' });
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting pending count:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

// Get candidate full history with marks, position name, and position ID
exports.getCandidateHistory = async (req, res) => {
  try {
    const { candidateId, positionId } = req.params;

    if (!candidateId || !positionId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID and Position ID are required"
      });
    }

    const TestAttempt = require("../../models/TestAttempt");
    const TestResult = require("../../models/Test");
    const Position = require("../../models/Position");

    // Get candidate details
    const candidate = await Candidate.findById(candidateId)
      .populate('position', 'name _id');
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Get position details
    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found"
      });
    }

    // Get all test results directly by candidateId and positionId
    const testResults = await TestResult.find({ candidateId, positionId })
      .sort({ attemptNumber: 1, createdAt: 1 });

    // Get all test attempts for this candidate-position combination
    const attempts = await TestAttempt.find({ candidateId, positionId })
      .populate('testResultId')
      .sort({ attemptNumber: 1 });

    // Create a map of attemptNumber to test result for quick lookup
    const resultsByAttemptNumber = {};
    testResults.forEach(result => {
      if (result.attemptNumber) {
        resultsByAttemptNumber[result.attemptNumber] = result;
      }
    });

    // Create a map of attemptNumber to attempt for quick lookup
    const attemptsByAttemptNumber = {};
    attempts.forEach(attempt => {
      attemptsByAttemptNumber[attempt.attemptNumber] = attempt;
    });

    // Combine attempts and results, prioritizing direct test results
    const allAttemptNumbers = new Set([
      ...Object.keys(resultsByAttemptNumber).map(Number),
      ...Object.keys(attemptsByAttemptNumber).map(Number)
    ]);

    // Format attempts with marks from test results
    const attemptHistory = Array.from(allAttemptNumbers)
      .sort((a, b) => a - b)
      .map(attemptNumber => {
        const result = resultsByAttemptNumber[attemptNumber];
        const attempt = attemptsByAttemptNumber[attemptNumber];
        
        return {
          attemptId: attempt?._id || null,
          attemptNumber: attemptNumber,
          status: attempt?.status || (result ? 'completed' : 'unknown'),
          startedAt: attempt?.startedAt || result?.createdAt || null,
          completedAt: attempt?.completedAt || result?.createdAt || null,
          isLatest: attempt?.isLatest || false,
          score: result ? result.score : null,
          totalQuestions: result ? result.totalQuestions : null,
          correctAnswers: result ? result.answers.filter(a => a.isCorrect).length : null,
          timeTakenFormatted: result ? result.timeTakenFormatted : null,
          submittedAt: result ? result.createdAt : null
        };
      });

    return res.status(200).json({
      success: true,
      data: {
        candidate: {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone
        },
        position: {
          id: position._id,
          name: position.name,
          positionNumber: position._id.toString() // Using ID as position number
        },
        attemptHistory
      }
    });
  } catch (error) {
    console.error('Error fetching candidate history:', error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

