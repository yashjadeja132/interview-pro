const CandidateTestProgress = require('../../models/CandidateTestProgress');
// ✅ Save or update progress
exports.saveProgress = async (req, res) => {
  try {
    const { candidateId, positionId, progress } = req.body;
    console.log(' SAVE PROGRESS - Updated progress');
console.log(candidateId, positionId)
    if (!candidateId || !positionId  || !progress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Extract actual question array
    const questionsArray = Array.isArray(progress.questions) ? progress.questions : [];
    const updated = await CandidateTestProgress.findOneAndUpdate(
      { candidateId, positionId },
      {
        candidateId,
        positionId,
        progress: questionsArray,      // <-- save only the question array
        currentQuestionIndex: progress.currentQuestionIndex,
        timeLeft: progress.timeLeft,
        lastSavedAt: new Date()
      },
      { upsert: true, new: true }
    );
    res.status(200).json({
      message: "Progress saved successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error saving progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get saved progress (for resume)
exports.getProgress = async (req, res) => {
  console.log("📝 GET PROGRESS - Fetching progress");
  try {
      const { candidateId, positionId } = req.params;
    const savedProgress = await CandidateTestProgress.findOne({
      candidateId, positionId
    });

    if (!savedProgress) {
      return res.status(204).json({ message: "No progress found" });
    }

    res.status(200).json({
      message: "Progress fetched successfully",
      data: savedProgress
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Optional: delete/reset progress after submission
exports.resetProgress = async (req, res) => {
  try {
      const { candidateId, positionId } = req.params;

    await CandidateTestProgress.findOneAndDelete({ candidateId, positionId });

    res.status(200).json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error("Error resetting progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
