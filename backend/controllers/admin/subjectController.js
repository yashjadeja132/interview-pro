const Subject = require('../../models/Subject');

// Add a new subject
exports.addSubject = async (req, res) => {
  try {
    const { name, type } = req.body;
    const existing = await Subject.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Subject already exists" });
    }

    const subject = new Subject({ name, type });
    await subject.save();

    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all subjects with pagination and search
exports.getSubjects = async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await Subject.countDocuments(filter);
    const subjects = await Subject.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: subjects,
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

// Get subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Check if name is taken by another subject
    if (name) {
      const existing = await Subject.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ success: false, message: "Another subject with this name already exists" });
      }
    }

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, type },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};