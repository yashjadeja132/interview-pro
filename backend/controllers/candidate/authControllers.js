const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Candidate = require('../../models/Candidate');
const testResult = require('../../models/Test');
const RetestRequest = require('../../models/RetestRequest');
module.exports.registerCandidate = async (req, res) => {
    try {
        const { email } = req.tokenData;
        const { name, password, phone, position, experience } = req.body;
        const resume = req.file ? `${process.env.UploadLink}//uploads/resume/${req.file.filename}` : null;

        //  return
        const exist = await Candidate.findOne({ email })
        if (exist) {
            return res.status(400).json({ message: "Email already registered" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const candidate = new Candidate({
            name, email, password: hashedPassword, phone, position, experience, resume
        })
        const token = jwt.sign(
            { id: candidate._id, role: "Candidate" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        await candidate.save()
        return res.status(201).json({
            message: 'you are registered successfully', candidate: {
                _id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                position: candidate.position,
            },
            token
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports.loginCandidate = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const candidate = await Candidate.findOne({ email }).populate('position', '_id name')
        if (!candidate) {
            return res.status(404).json({ message: 'User not found' })
        }
        const isMatch = bcrypt.compare(password, candidate.password);
        if (!isMatch)
            return res.status(400).json({ message: 'invalid credentials' })
      
        const now = new Date();
        if (candidate.schedule) {
            const scheduleTime = new Date(candidate.schedule);
            const thirtyMinutesAfterSchedule = new Date(scheduleTime.getTime() + 30 * 60 * 1000); // Add 30 minutes in milliseconds
            
            // Block login if current time is before scheduled time
            if (now < scheduleTime) {
                console.log('login before scheduled time')
                return res.status(403).json({
                    message: "⏳ Please login at your scheduled interview time",
                });
            }
            
            // Block login if current time is more than 30 minutes after scheduled time
            if (now > thirtyMinutesAfterSchedule) {
                console.log('login after 30 minutes window')
                return res.status(403).json({
                    message: "⏰ Your login window has expired. The interview window was only available for 30 minutes after the scheduled time.",
                });
            }
        }
        
        // Check if test is already submitted (isSubmitted: 1)
        const positionId = candidate.position._id || candidate.position; // Handle both populated and non-populated
        const submittedTest = await testResult.findOne({
            candidateId: candidate._id,
            positionId: positionId,
            isSubmitted: 1
        });
        
        if (submittedTest) {
            return res.status(403).json({
                message: "You have already submitted the test. You cannot login again.",
            });
        }
        
        // Check for retest request status - COMMENTED OUT
        // const retestRequest = await RetestRequest.findOne({
        //     candidateId: candidate._id,
        //     positionId: positionId
        // }).sort({ createdAt: -1 });
        // console.log('retestRequest check:', {
        //     candidateId: candidate._id,
        //     positionId: positionId,
        //     found: !!retestRequest,
        //     status: retestRequest?.status
        // });
        const token = jwt.sign({ id: candidate._id, email: candidate.email }, process.env.JWT_SECRET, { expiresIn: '2m' })
        
        // If there's a pending request, show notification but don't block login - COMMENTED OUT
        // If there's an approved request, allow them to proceed
        // const retestRequestInfo = retestRequest ? {
        //     hasRequest: true,
        //     status: retestRequest.status,
        //     requestedAt: retestRequest.requestedAt,
        //     isPending: retestRequest.status === 'pending',
        //     isApproved: retestRequest.status === 'approved'
        // } : {
        //     hasRequest: false
        // };

        return res.status(200).json({
            message: 'logged sucessfully',
            token,
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                position: candidate.position,
                questionsAskedToCandidate: candidate.questionsAskedToCandidate
            }
            // retestRequest: retestRequestInfo - COMMENTED OUT
        })
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}