const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Candidate = require('../../models/Candidate');
const testResult = require('../../models/Test');
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
        // if (candidate.email === email) {
        //     return res.status(403).json({
        //         message: "You are not authorized to login.",
        //     });
        // }
        if (!candidate) {
            return res.status(404).json({ message: 'User not found' })
        }
        const isMatch = bcrypt.compare(password, candidate.password);
        if (!isMatch)
            return res.status(400).json({ message: 'invalid credentials' })
      
        const now = new Date();
        if (candidate.schedule) {
            const scheduleTime = new Date(candidate.schedule);
            
             // Get Admin Configured Login Time
            const LoginTime = require('../../models/logintime');
            const loginTimeSettings = await LoginTime.findOne();
            const allowedMinutes = loginTimeSettings?.timeDurationForTest || 30; // Default to 30 if not set
            console.log('allowedMinutes', allowedMinutes);
            const expirationTime = new Date(scheduleTime.getTime() + allowedMinutes * 60 * 1000); 
            console.log('expirationTime', expirationTime);
            // Block login if current time is before scheduled time
            if (now < scheduleTime) {
                console.log('login before scheduled time')
                return res.status(403).json({
                    message: "⏳ Please login at your scheduled interview time",
                });
            }
            
            // Block login if current time is after expiration time
            if (now > expirationTime) {
                console.log('login after expiration window')
                return res.status(403).json({
                    message: `⏰ Your login window has expired. You could only login within ${allowedMinutes} minutes of your scheduled time.`,
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
        
        const token = jwt.sign({ id: candidate._id, email: candidate.email }, process.env.JWT_SECRET, { expiresIn: '2m' })

        return res.status(200).json({
            message: 'logged sucessfully',
            token,
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                position: candidate.position,
                questionsAskedToCandidate: candidate.questionsAskedToCandidate,
                timeforTest: candidate.timeforTest
            }
        })
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}