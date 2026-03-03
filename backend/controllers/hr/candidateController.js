 const Candidate = require("../../models/Candidate");
const Question = require("../../models/Question");
const Position = require("../../models/Position");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const {sendCandidateMail, sendRescheduleMail} = require('../../services/hrEmailServices')
const TestResult = require("../../models/Test");

// Get all candidates with pagination, search, and filtering
exports.getCandidates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const position = req.query.position || '';
    const experience = req.query.experience || '';
    const status = req.query.status || '';
    // Build query object
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by position
    if (position) {
      query.position = position;
    }

    // Filter by experience
    if (experience) {
      query.experience = experience;
    }

    // Filter by status (based on isSubmitted)
    if (status) {
      switch (status) {
        case 'completed':
          query.isSubmitted = 1;
          break;
        case 'pending':
          query.$or = [
            { isSubmitted: { $exists: false } },
            { isSubmitted: 0 }
          ];
          break;
        case 'scheduled':
          // For scheduled, we check if schedule exists and isSubmitted is 0
          query.schedule = { $exists: true };
          query.isSubmitted = { $ne: 1 };
          break;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get candidates with pagination
    let candidates = await Candidate.find(query, '-password -createdAt -updatedAt')
      .sort({ createdAt: -1 })
      .populate('position', 'name')
      .skip(skip)
      .limit(limit);
    // Get total count for pagination
    const total = await Candidate.countDocuments(query);

    // Map to convert position object -> string and format data
    candidates = candidates.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      experience: c.experience,
      position: c.position?._id, // Keep position ID for frontend
      positionName: c.position?.name, // Add position name for display
      schedule: c.schedule,
      timeforTest: c.timeforTest,
      questionsAskedToCandidate: c.questionsAskedToCandidate, // Include questionsAskedToCandidate
      technicalQuestions: c.technicalQuestions,
      logicalQuestions: c.logicalQuestions,
      isNagativeMarking: c.isNagativeMarking || false,
      negativeMarkingValue: c.negativeMarkingValue || "",
      description: c.description, // Include description
      isSubmitted: c.isSubmitted || 0 // Include isSubmitted field
    }));
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: candidates,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching candidates:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single candidate by ID
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const { name, email, phone, experienceYears, experienceMonths, position,timeDurationForTest, questionsAskedToCandidate, technicalQuestions, logicalQuestions, isNagativeMarking, negativeMarkingValue, description } = req.body;
    const timefortest = parseInt(timeDurationForTest);
    
    let finalExperience;
    if (experienceYears !== undefined || experienceMonths !== undefined) {
      const years = parseInt(experienceYears || 0);
      const months = parseInt(experienceMonths || 0);
      
      const yearText = years === 1 ? "year" : "years";
      const monthText = months === 1 ? "month" : "months";

      if (years > 0 && months > 0) {
        finalExperience = `${years} ${yearText} ${months} ${monthText}`;
      } else if (years > 0) {
        finalExperience = `${years} ${yearText}`;
      } else if (months > 0) {
        finalExperience = `${months} ${monthText}`;
      } else {
        finalExperience = "0 years";
      }
    }

    const updateData = { 
      name, email, phone, position,timefortest, 
      technicalQuestions, logicalQuestions, isNagativeMarking, negativeMarkingValue, description,
      experienceYears: parseInt(experienceYears || 0),
      experienceMonths: parseInt(experienceMonths || 0),
      questionsAskedToCandidate: (parseInt(technicalQuestions) || 0) + (parseInt(logicalQuestions) || 0)
    };
    if (finalExperience !== undefined) {
      updateData.experience = finalExperience;
    }

    // Check for duplicate candidate with same email and phone (excluding current candidate)
    if (email && phone) {
      const existingDuplicate = await Candidate.findOne({ 
        email, 
        phone, 
        _id: { $ne: req.params.id } 
      });

      if (existingDuplicate) {
        // Fetch latest test result for the duplicate candidate
        const lastTest = await TestResult.findOne({ candidateId: existingDuplicate._id }).sort({ createdAt: -1 });
        
        return res.status(409).json({
          message: "Candidate already exists with this email and phone number",
          candidate: {
            _id: existingDuplicate._id,
            name: existingDuplicate.name,
            email: existingDuplicate.email,
            phone: existingDuplicate.phone,
            schedule: existingDuplicate.schedule,
            score: lastTest ? lastTest.score : null,
            attemptNumber: lastTest ? lastTest.attemptNumber : 0
          }
        });
      }
    }

    // Get existing candidate to use current values if fields aren't being updated
    const existingCandidate = await Candidate.findById(req.params.id);
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Use position from updateData or existing candidate position
    const positionId = position || existingCandidate.position;
    
    if (!positionId) {
      return res.status(400).json({ message: "Position is required to validate questions" });
    }

    // Fetch position details for validation
    const positionDoc = await Position.findById(positionId);
    if (!positionDoc) {
      return res.status(404).json({ message: "Position not found" });
    }

    const numberOfNonTechnicalQuestions = positionDoc.nonTechQuestionCount || 0;
    const technicalQuestionsCount = positionDoc.techQuestionCount || 0;

    // Validate logicalQuestions against position-specific non-technical questions
    if (logicalQuestions !== undefined && logicalQuestions !== null) {
      const logicalCount = parseInt(logicalQuestions);
      if (isNaN(logicalCount) || logicalCount < 0) {
        return res.status(400).json({ message: "Logical questions must be a positive number" });
      }
      if (logicalCount > numberOfNonTechnicalQuestions) {
        return res.status(400).json({ 
          message: `Only ${numberOfNonTechnicalQuestions} non-technical questions are allowed for this position according to its configuration.` 
        });
      }
      updateData.logicalQuestions = logicalCount;
    }
    
    // Validate technicalQuestions against position-specific technical questions
    if (technicalQuestions !== undefined && technicalQuestions !== null) {
      const technicalCount = parseInt(technicalQuestions);
      if (isNaN(technicalCount) || technicalCount < 0) {
        return res.status(400).json({ message: "Technical questions must be a positive number" });
      }
      if (technicalCount > technicalQuestionsCount) {
        return res.status(400).json({ 
          message: `Only ${technicalQuestionsCount} technical questions are allowed for this position according to its configuration.` 
        });
      }
      updateData.technicalQuestions = technicalCount;
    }

    // Validation for technical and logical questions sum is now handled by automatic calculation
    // Derived questionsAskedToCandidate value is already in updateData

    if (req.file) {
      updateData.resume = req.file.filename; // update resume if uploaded
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate updated", candidate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({ message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Bulk delete candidates
exports.bulkDeleteCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;
    
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ message: "Candidate IDs are required" });
    }

    // Validate that all IDs are valid MongoDB ObjectIds
    const validIds = candidateIds.filter(id => {
      try {
        return /^[0-9a-fA-F]{24}$/.test(id);
      } catch {
        return false;
      }
    });

    if (validIds.length !== candidateIds.length) {
      return res.status(400).json({ message: "Invalid candidate IDs provided" });
    }

    // Delete candidates
    const result = await Candidate.deleteMany({ _id: { $in: validIds } });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No candidates found to delete" });
    }

    res.status(200).json({ 
      message: `${result.deletedCount} candidate(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting candidates:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createCandidate=async(req,res)=>{
   try {
       const { email,name, phone, position, experienceYears, experienceMonths, timeDurationForTest,technicalQuestions,logicalQuestions, isNagativeMarking, negativeMarkingValue, description} = req.body;
       const {allowDuplicate} = req.body; 
       const years = parseInt(experienceYears || 0);
       const months = parseInt(experienceMonths || 0);
       const yearText = years === 1 ? "year" : "years";
       const monthText = months === 1 ? "month" : "months";

       let experience = "";
       if (years > 0 && months > 0) {
         experience = `${years} ${yearText} ${months} ${monthText}`;
       } else if (years > 0) {
         experience = `${years} ${yearText}`;
       } else if (months > 0) {
         experience = `${months} ${monthText}`;
       } else {
         experience = "0 years";
       }
       console.log('experience',experience)
       const timeforTest = parseInt(timeDurationForTest); 
          // Check if position is provided
          if (!position) {
            return res.status(400).json({ message: "Position is required" });
          }

        
          // questionsAskedToCandidate is now derived from technical and logical questions
          const derivedQuestionsAsked = (parseInt(technicalQuestions) || 0) + (parseInt(logicalQuestions) || 0);

          // Validate against position presets
          const positionDoc = await Position.findById(position);
          if (!positionDoc) {
            return res.status(404).json({ message: "Position not found" });
          }

          if (technicalQuestions > positionDoc.techQuestionCount) {
            return res.status(400).json({ message: `Technical questions cannot exceed position limit of ${positionDoc.techQuestionCount}` });
          }
          if (logicalQuestions > positionDoc.nonTechQuestionCount) {
            return res.status(400).json({ message: `Non-technical questions cannot exceed position limit of ${positionDoc.nonTechQuestionCount}` });
          }
          
          const schedule = req.body.schedule ? new Date(req.body.schedule) : null;  
            // Check for duplicate with Email AND Phone
            const previousExist = await Candidate.find({ email, phone }).populate('position');
             console.log('previousExist',previousExist.length)
            if (previousExist.length > 0 && !allowDuplicate) {
                const candidateIds = previousExist.map(c => c._id);
                 const existingResults = await TestResult.find({
                    candidateId: { $in: candidateIds },
                 }).populate("positionId", "name")
                 .sort({ createdAt: -1 });
                 console.log('existingResults',existingResults)
                   console.log('existingResults length',existingResults.length)
                   const scoreHistory = existingResults.map(result => ({
                     position: result.positionId?.name || "Unknown Position",
                      score: result.score,
                      date: result.createdAt,
                      marks:result.totalMarks
                    }));
                    console.log('scoreHistory',scoreHistory)
              return res.status(409).json({
                message: "Candidate already exists with this email and phone number",
                candidate: {
                  name:previousExist[0].name,
                  email:previousExist[0].email,
                  phone:previousExist[0].phone,
                  position:previousExist[0].position.name ,
                  attemptNumber: existingResults.length,
                  scoreHistory
                }
              }); 
            }
             
          // derivedQuestionsAsked will be used in candidate creation

           const plainPassword = Math.random().toString(36).slice(-8); // 8-char password
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
         
          const candidate = new Candidate({
              name, email, password: hashedPassword,phone ,position, experience,  
              schedule, questionsAskedToCandidate: derivedQuestionsAsked,
              technicalQuestions, logicalQuestions ,timeforTest, isNagativeMarking, negativeMarkingValue, description
          })
      const token = jwt.sign(
        { id: candidate._id, role: "Candidate" ,schedule:candidate.schedule},
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );        
          await candidate.save()
              await candidate.populate("position");
          await sendCandidateMail(candidate,plainPassword) 
          return res.status(201).json({ message: 'you are registered successfully',  candidate: {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: candidate.position.name,    
            schedule, // stored as Date in Mongo
        },
        token })
      } catch (error) {
          console.log(error)
          return res.status(500).json({ message: "Internal Server Error" })
      }
}

// Reschedule candidate interview
exports.rescheduleCandidate = async (req, res) => {
  try {
    const { newSchedule } = req.body;

    if (!newSchedule) {
      return res.status(400).json({ message: "New schedule time is required" });
    }

    const newDate = new Date(newSchedule);
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (newDate < new Date()) {
      return res.status(400).json({ message: "New schedule cannot be in the past" });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const oldSchedule = candidate.schedule;
    candidate.schedule = newDate;

    // Reset expired status so they can login at new time
    if (candidate.isSubmitted === 2) {
      candidate.isSubmitted = 0;
    }

    await candidate.save();
    await candidate.populate("position");

    // Send reschedule email
    await sendRescheduleMail(candidate, oldSchedule);

    res.status(200).json({
      message: "Interview rescheduled successfully",
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        schedule: candidate.schedule,
        positionName: candidate.position?.name,
      },
    });
  } catch (error) {
    console.error("Error rescheduling candidate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};