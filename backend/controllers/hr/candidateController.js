 const Candidate = require("../../models/Candidate");
const Question = require("../../models/Question");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const {sendCandidateMail} = require('../../services/hrEmailServices')

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
      .populate('position', 'name -_id')
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
    const { name, email, phone, experience, position,timeDurationForTest, questionsAskedToCandidate, technicalQuestions, logicalQuestions, isNagativeMarking, negativeMarkingValue } = req.body;
    const timefortest = parseInt(timeDurationForTest);
    const updateData = { name, email, phone, experience, position,timefortest, questionsAskedToCandidate, technicalQuestions, logicalQuestions, isNagativeMarking, negativeMarkingValue };
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

    // Count questions for the specific position
    const numberOfNonTechnicalQuestions = await Question.countDocuments({
      position: positionId,
      category: {$exists: true}
    });
    const technicalQuestionsCount = await Question.countDocuments({
      position: positionId,
      category: {$exists: false}
    });

    // Validate logicalQuestions against position-specific non-technical questions
    if (logicalQuestions !== undefined && logicalQuestions !== null) {
      const logicalCount = parseInt(logicalQuestions);
      if (isNaN(logicalCount) || logicalCount < 0) {
        return res.status(400).json({ message: "Logical questions must be a positive number" });
      }
      if (logicalCount > numberOfNonTechnicalQuestions) {
        if (numberOfNonTechnicalQuestions === 0) {
          return res.status(400).json({ 
            message: "No logical questions available for this position yet. Please add questions first." 
          });
        }
        return res.status(400).json({ 
          message: `Only ${numberOfNonTechnicalQuestions} logical question${numberOfNonTechnicalQuestions !== 1 ? 's' : ''} available for this position. Not enough questions.` 
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
        if (technicalQuestionsCount === 0) {
          return res.status(400).json({ 
            message: "No technical questions available for this position yet. Please add questions first." 
          });
        }
        return res.status(400).json({ 
          message: `Only ${technicalQuestionsCount} technical question${technicalQuestionsCount !== 1 ? 's' : ''} available for this position. Not enough questions.` 
        });
      }
      updateData.technicalQuestions = technicalCount;
    }

    // Validate questionsAskedToCandidate if provided
    if (questionsAskedToCandidate !== undefined && questionsAskedToCandidate !== null) {
      const questionCount = parseInt(questionsAskedToCandidate);
      if (isNaN(questionCount) || questionCount < 0) {
        return res.status(400).json({ message: "Questions asked to candidate must be a positive number" });
      }
      
      // Get available questions count for the position
      const availableQuestions = await Question.countDocuments({ position: positionId });
      
      if (questionCount > availableQuestions) {
        if (availableQuestions === 0) {
          return res.status(400).json({ 
            message: "No questions available for this position yet. Please add questions first." 
          });
        }
        return res.status(400).json({ 
          message: `Only ${availableQuestions} question${availableQuestions !== 1 ? 's' : ''} available for this position. Not enough questions.` 
        });
      }
      
      updateData.questionsAskedToCandidate = questionCount;
    }

    // Validate that Technical Questions + Logical Questions = Questions Asked To Candidate
    // Use updated values if provided, otherwise use existing candidate values
    const finalTechnicalCount = updateData.technicalQuestions !== undefined ? updateData.technicalQuestions : 
                               (existingCandidate.technicalQuestions !== undefined ? existingCandidate.technicalQuestions : null);
    const finalLogicalCount = updateData.logicalQuestions !== undefined ? updateData.logicalQuestions : 
                             (existingCandidate.logicalQuestions !== undefined ? existingCandidate.logicalQuestions : null);
    const finalQuestionCount = updateData.questionsAskedToCandidate !== undefined ? updateData.questionsAskedToCandidate : 
                              (existingCandidate.questionsAskedToCandidate !== undefined ? existingCandidate.questionsAskedToCandidate : null);

    // Only validate sum if all three values are provided (either updated or existing)
    if (finalTechnicalCount !== null && finalLogicalCount !== null && finalQuestionCount !== null) {
      const sum = finalTechnicalCount + finalLogicalCount;
      if (sum !== finalQuestionCount) {
        return res.status(400).json({ 
          message: `The sum of Technical Questions (${finalTechnicalCount}) and Logical Questions (${finalLogicalCount}) must equal Questions Asked To Candidate (${finalQuestionCount}). Current sum: ${sum}` 
        });
      }
    }

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
          const { email,name, phone, position, experience, timeDurationForTest,questionsAskedToCandidate,technicalQuestions,logicalQuestions, isNagativeMarking, negativeMarkingValue} = req.body;
            const timeforTest = parseInt(timeDurationForTest);
        
          // Check if position is provided
          if (!position) {
            return res.status(400).json({ message: "Position is required" });
          }

          // Count questions for the specific position
          const numberOfNonTechnicalQuestions = await Question.countDocuments({
            position: position,
            category: {$exists: true}
          });
          const technicalQuestionsCount = await Question.countDocuments({
            position: position,
            category: {$exists: false}
          });
          
          // Validate logicalQuestions against position-specific non-technical questions
          if (logicalQuestions !== undefined && logicalQuestions !== null) {
            const logicalCount = parseInt(logicalQuestions);
            if (isNaN(logicalCount) || logicalCount < 0) {
              return res.status(400).json({ message: "Logical questions must be a positive number" });
            }
            if (logicalCount > numberOfNonTechnicalQuestions) {
              if (numberOfNonTechnicalQuestions === 0) {
                return res.status(400).json({ 
                  message: "No logical questions available for this position yet. Please add questions first." 
                });
              }
              return res.status(400).json({ 
                message: `O ${numberOfNonTechnicalQuestions} logical question${numberOfNonTechnicalQuestions !== 1 ? 's' : ''} available for this position. Not enough questions.` 
              });
            }
          }
          
          // Validate technicalQuestions against position-specific technical questions
          if (technicalQuestions !== undefined && technicalQuestions !== null) {
            const technicalCount = parseInt(technicalQuestions);
            if (isNaN(technicalCount) || technicalCount < 0) {
              return res.status(400).json({ message: "Technical questions must be a positive number" });
            }
            if (technicalCount > technicalQuestionsCount) {
              if (technicalQuestionsCount === 0) {
                return res.status(400).json({ 
                  message: "No technical questions available for this position yet. Please add questions first." 
                });
              }
              console.log('technicalQuestionsCount',technicalQuestionsCount)
              console.log('technicalCount',technicalCount)

              return res.status(400).json({ 
                message: `Only ${technicalQuestionsCount} technical question${technicalQuestionsCount !== 1 ? 's' : ''} available for this position.` 
              });
            }
          }
          
          // Validate that Technical Questions + Logical Questions = Questions Asked To Candidate
          // Only validate if all three values are provided
          if (questionsAskedToCandidate !== undefined && questionsAskedToCandidate !== null &&
              technicalQuestions !== undefined && technicalQuestions !== null &&
              logicalQuestions !== undefined && logicalQuestions !== null) {
            const questionCount = parseInt(questionsAskedToCandidate);
            const technicalCount = parseInt(technicalQuestions);
            const logicalCount = parseInt(logicalQuestions);
            const sum = technicalCount + logicalCount;
            
            if (sum !== questionCount) {
              return res.status(400).json({ 
                message: `The sum of Technical Questions (${technicalCount}) and Logical Questions (${logicalCount}) must equal Questions Asked To Candidate (${questionCount}). Current sum: ${sum}` 
              });
            }
          }
          
          const schedule = req.body.schedule ? new Date(req.body.schedule) : null;  
          const exist = await Candidate.findOne({ email })
          if (exist) {
              return res.status(400).json({ message: "Email already registered" })
          }

          // Validate questionsAskedToCandidate if provided
          if (questionsAskedToCandidate !== undefined && questionsAskedToCandidate !== null) {
            const questionCount = parseInt(questionsAskedToCandidate);
            if (isNaN(questionCount) || questionCount < 0) {
              return res.status(400).json({ message: "Questions asked to candidate must be a positive number" });
            }
            
            // Check if position is provided
            if (!position) {
              return res.status(400).json({ message: "Position is required to validate questions" });
            }
            
            // Get available questions count for the position
            const availableQuestions = await Question.countDocuments({ position: position });
            
            if (questionCount > availableQuestions) {
             
              if (availableQuestions === 0) {
                // console.log('availableQuestions is ',availableQuestions)
                // console.log('questionCount is ',questionCount)
                return res.status(400).json({ 
                  message: "No questions available for this position yet. Please add questions first." 
                });
              }
              return res.status(400).json({ 
                message: `Only ${availableQuestions} question${availableQuestions !== 1 ? 's' : ''} available for this position. Not enough questions.` 
              });
            }
          }

           const plainPassword = Math.random().toString(36).slice(-8); // 8-char password
          const hashedPassword = await bcrypt.hash(plainPassword, 10);
         
          const candidate = new Candidate({
              name, email, password: hashedPassword,phone ,position, experience, schedule, questionsAskedToCandidate,
              technicalQuestions, logicalQuestions ,timeforTest, isNagativeMarking, negativeMarkingValue
          })
          console.log('candidate is ',candidate)
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
          console.log(error.message)
          return res.status(500).json({ message: "Internal Server Error" })
      }
}