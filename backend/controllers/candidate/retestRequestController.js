const RetestRequest = require("../../models/RetestRequest");
const Candidate = require("../../models/Candidate");
const TestAttempt = require("../../models/TestAttempt");

// Request retest
exports.requestRetest = async (req, res) => {
  try {
    const candidateId = req.user?.id || req.body.candidateId;
    
    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const positionId = candidate.position; // This is already an ObjectId

    // Check if there's already a pending request
    const existingRequest = await RetestRequest.findOne({
      candidateId,
      positionId: positionId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "You already have a pending retest request. Please wait for admin approval." 
      });
    }

    // Check if candidate has completed at least one test attempt
    const hasAttempt = await TestAttempt.findOne({ 
      candidateId,
      positionId: positionId,
      status: 'completed'
    });

    if (!hasAttempt) {
      return res.status(400).json({ 
        message: "You must complete at least one test before requesting a retest." 
      });
    }

    // Create new retest request
    const retestRequest = new RetestRequest({
      candidateId,
      positionId: positionId,
      status: 'pending'
    });

    console.log('Saving retest request:', {
      candidateId: retestRequest.candidateId,
      positionId: retestRequest.positionId,
      status: retestRequest.status
    });

    await retestRequest.save();
    console.log('Retest request saved successfully:', retestRequest._id);

    await retestRequest.populate('candidateId', 'name email');
    await retestRequest.populate('positionId', 'name');

    return res.status(201).json({
      message: "Retest request submitted successfully. Admin will review your request.",
      request: retestRequest
    });
  } catch (error) {
    console.error('Error requesting retest:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get candidate's retest request status
exports.getMyRetestRequest = async (req, res) => {
  try {
    const candidateId = req.user?.id || req.params.candidateId;
    
    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const retestRequest = await RetestRequest.findOne({
      candidateId,
      positionId: candidate.position
    })
    .sort({ createdAt: -1 })
    .populate('positionId', 'name');

    if (!retestRequest) {
      return res.status(200).json({ 
        hasRequest: false,
        message: "No retest request found" 
      });
    }

    return res.status(200).json({
      hasRequest: true,
      request: retestRequest
    });
  } catch (error) {
    console.error('Error getting retest request:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

