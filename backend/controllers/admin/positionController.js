const Position = require('../../models/Position')
const Question = require('../../models/Question')
const Candidate = require('../../models/Candidate')

// Add a new position
exports.addPosition = async (req, res) => {
  try {
    const { name, salary, experienceYears, experienceMonths, vacancies, shift, jobType, testDuration, subjects, techQuestionCount, nonTechQuestionCount } = req.body;
    const existing = await Position.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Position already exists" });
    }

    let finalExperience = "";
    if (experienceYears !== undefined || experienceMonths !== undefined) {
      const years = parseInt(experienceYears || 0);
      const months = parseInt(experienceMonths || 0);
      finalExperience = `${years} year ${months} month`;
    }

      const position = new Position({
      name,
      salary,
      experience: finalExperience,
      vacancies,
      shift,
      jobType,
      testDuration,
      subjects,
      techQuestionCount,
      nonTechQuestionCount,
    });
    await position.save();
    res.status(201).json({ success: true, data: position });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPositions = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { vacancy, jobType, salary, shift, search, experience, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of the day to capture all records for that day
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
   // Filter by experience
if (experience && experience !== 'all') {
  if (experience === "0-1 years") {
    filter.$or = [
      { experience: { $regex: "^0\\s+year", $options: "i" } },
      { experience: { $regex: "fresher", $options: "i" } },
    ];
  } else if (experience === "1-3 years") {
    filter.$or = [
      { experience: { $regex: "^1\\s+year", $options: "i" } },
      { experience: { $regex: "^2\\s+year", $options: "i" } },
    ];
  } else if (experience === "3-5 years") {
    filter.$or = [
      { experience: { $regex: "^3\\s+year", $options: "i" } },
      { experience: { $regex: "^4\\s+year", $options: "i" } },
    ];
  } else if (experience === "5+ years") {
    filter.experience = { $regex: "^([5-9]|[1-9][0-9]+)\\s+year", $options: "i" };
  } else {
    // exact or partial match fallback
    filter.experience = { $regex: experience, $options: "i" };
  }
}
    // Get total count for pagination
    const total = await Position.countDocuments(filter);

    // Fetch positions with filters and pagination
    let positions = await Position.find(filter)
      .sort({ createdAt: -1 })
      .select('-updatedAt -__v')
      .skip(skip)
      .limit(limit)
      .populate('subjects', 'name type');

    // Get question counts for each position
    const positionsWithCounts = await Promise.all(
      positions.map(async (position) => {
        // Separate technical and non-technical subject IDs
        const techSubjectIds = position.subjects
          .filter(s => s.type === 1)
          .map(s => s._id);
        
        const nonTechSubjectIds = position.subjects
          .filter(s => s.type === 2)
          .map(s => s._id);

        // Count questions for tech and non-tech subjects
        const [technicalQuestionCount, nonTechnicalQuestionCount, candidateCount] = await Promise.all([
          Question.countDocuments({ subject: { $in: techSubjectIds } }),
          Question.countDocuments({ subject: { $in: nonTechSubjectIds } }),
          Candidate.countDocuments({ position: position._id })
        ]);

        const TotalQuestionsCount = technicalQuestionCount + nonTechnicalQuestionCount;
        
        return {
          ...position.toObject(),
          TotalQuestionsCount,
          technicalQuestionCount,
          nonTechnicalQuestionCount,
          hasCandidates: candidateCount > 0,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      success: true, 
      data: positionsWithCounts, 
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
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id).populate('subjects', 'name type');
    if (!position) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }

    // Separate technical and non-technical subject IDs
    const techSubjectIds = position.subjects
      .filter(s => s.type === 1)
      .map(s => s._id);
    
    const nonTechSubjectIds = position.subjects
      .filter(s => s.type === 2)
      .map(s => s._id);

    // Count questions for tech and non-tech subjects, and check for candidates
    const [technicalQuestionCount, nonTechnicalQuestionCount, candidateCount] = await Promise.all([
      Question.countDocuments({ subject: { $in: techSubjectIds } }),
      Question.countDocuments({ subject: { $in: nonTechSubjectIds } }),
      Candidate.countDocuments({ position: position._id })
    ]);

    const data = {
      ...position.toObject(),
      technicalQuestionCount,
      nonTechnicalQuestionCount,
      TotalQuestionsCount: technicalQuestionCount + nonTechnicalQuestionCount,
      hasCandidates: candidateCount > 0
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { name, salary, experienceYears, experienceMonths, vacancies, shift, jobType, testDuration, subjects, techQuestionCount, nonTechQuestionCount } = req.body;
    
    // Check if position exists and has candidates
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ success: false, message: "Position not found" });
    }

    if (name && name !== position.name) {
      const candidateCount = await Candidate.countDocuments({ position: req.params.id });
      if (candidateCount > 0) {
        return res.status(400).json({ success: false, message: "Cannot change position name because candidates have already applied" });
      }
    }

    let finalExperience;
    if (experienceYears !== undefined || experienceMonths !== undefined) {
      const years = parseInt(experienceYears || 0);
      const months = parseInt(experienceMonths || 0);
      finalExperience = `${years} year ${months} month`;
    }

    const updateData = {
      name, 
      salary,
      vacancies,
      shift,
      jobType, 
      testDuration, 
      subjects, 
      techQuestionCount, 
      nonTechQuestionCount
    };

    if (finalExperience !== undefined) {
      updateData.experience = finalExperience;
    }

    const updated = await Position.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Get question counts by subject IDs
exports.getQuestionCounts = async (req, res) => {
  try {
    const { subjects } = req.body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.json({ success: true, data: { technicalQuestionCount: 0, nonTechnicalQuestionCount: 0 } });
    }

    // Populate subject details to separate by type
    const Subject = require('../../models/Subject');
    const subjectDocs = await Subject.find({ _id: { $in: subjects } });

    const techSubjectIds = subjectDocs.filter(s => s.type === 1).map(s => s._id);
    const nonTechSubjectIds = subjectDocs.filter(s => s.type === 2).map(s => s._id);

    const [technicalQuestionCount, nonTechnicalQuestionCount] = await Promise.all([
      techSubjectIds.length > 0 ? Question.countDocuments({ subject: { $in: techSubjectIds } }) : 0,
      nonTechSubjectIds.length > 0 ? Question.countDocuments({ subject: { $in: nonTechSubjectIds } }) : 0,
    ]);

    res.json({
      success: true,
      data: {
        technicalQuestionCount,
        nonTechnicalQuestionCount,
        totalAvailable: technicalQuestionCount + nonTechnicalQuestionCount,
      }
    });
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