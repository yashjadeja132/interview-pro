const Position = require('../../models/Position')
const Question = require('../../models/Question')

// Add a new position
exports.addPosition = async (req, res) => {
  try {
    const { name, salary, experience, vacancies, shift, jobType } = req.body;
    const existing = await Position.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Position already exists" });
    }

      const position = new Position({
      name,
      salary,
      experience,
      vacancies,
      shift,
      jobType,
    });
    console.log(position);
    await position.save();

    res.status(201).json({ success: true, data: position });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPositions = async (req, res) => {
  try {
    let positions = await Position.find().sort({ createdAt: -1 }).select('-updatedAt -__v');
    
    // Get question counts for each position
    const positionsWithCounts = await Promise.all(
      positions.map(async (position) => {
        const questionCount = await Question.countDocuments({ position: position._id });
        return {
          ...position.toObject(),
          questionCount
        };
      })
    );
    
    res.json({ success: true, data: positionsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }
    res.json({ success: true, data: position });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Position.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const deleted = await Position.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }
    res.json({ success: true, message: "Position deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};