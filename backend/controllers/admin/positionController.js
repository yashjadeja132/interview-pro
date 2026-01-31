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
    // Extract query parameters for filtering
    const { vacancy, jobType, salary, shift, search, experience } = req.query;
    // Build filter object
    let filter = {};
    
    // Filter by vacancy (exact match or range)
    if (vacancy) {
      filter.vacancies = Number(vacancy);
    }
    
    // Filter by job type
    if (jobType && jobType !== 'all') {
      filter.jobType = jobType;
    }
    
    // Filter by salary (minimum salary)
    if (salary) {
      filter.salary = { $gte: Number(salary) };
    }
    
    // Filter by shift
    if (shift && shift !== 'all') {
      filter.shift = shift;
    }
    
    // Filter by search term (position name)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
   // Filter by experience
if (experience && experience !== 'all') {
  if (experience === "0-1 years") {
    filter.$or = [
      { experience: { $regex: "0", $options: "i" } },
      { experience: { $regex: "1", $options: "i" } },
      { experience: { $regex: "fresher", $options: "i" } },
    ];
  } else if (experience === "1-3 years") {
    filter.$or = [
      { experience: { $regex: "1", $options: "i" } },
      { experience: { $regex: "2", $options: "i" } },
      { experience: { $regex: "3", $options: "i" } },
    ];
  } else if (experience === "3-5 years") {
    filter.$or = [
      { experience: { $regex: "3", $options: "i" } },
      { experience: { $regex: "4", $options: "i" } },
      { experience: { $regex: "5", $options: "i" } },
    ];
  } else if (experience === "5+ years") {
    filter.$or = [
      { experience: { $regex: "5", $options: "i" } },
      { experience: { $regex: "6", $options: "i" } },
      { experience: { $regex: "7", $options: "i" } },
      { experience: { $regex: "8", $options: "i" } },
      { experience: { $regex: "9", $options: "i" } },
      { experience: { $regex: "10", $options: "i" } },
    ];
  } else {
    // exact or partial match fallback
    filter.experience = { $regex: experience, $options: "i" };
  }
}
    // Fetch positions with filters
    let positions = await Position.find(filter).sort({ createdAt: -1 }).select('-updatedAt -__v');
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
    res.json({ success: true, data: positionsWithCounts, total: positionsWithCounts.length });
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
    const { name, salary,experience,vacancies,shift,jobType } = req.body;
    const updated = await Position.findByIdAndUpdate(
      req.params.id,
      { name, salary,experience,vacancies,shift,jobType },
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