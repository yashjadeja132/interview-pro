const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Candidate = require('../../models/Candidate');
const testResult = require('../../models/Test');
const LoginTime = require('../../models/logintime');

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
    // Find ALL candidates with this email
    const candidates = await Candidate.find({ email }).populate('position', '_id name');
    console.log('loginCandidate api called');

    // ✅ Check if ANY candidate exists
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Iterate through all candidates with this email to find matching password
    let candidate = null;
    for (const c of candidates) {
        const isMatch = await bcrypt.compare(password, c.password);
        if (isMatch) {
            candidate = c;
            break;
        }
    }

    if (!candidate) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const positionId = candidate.position?._id || candidate.position;

    // Check if THIS specific candidate record has already submitted the test
    const submittedTest = await testResult.findOne({
      candidateId: candidate._id,
      positionId: positionId,
      isSubmitted: 1,
    });

    if (submittedTest || candidate.isSubmitted === 1) {
      console.log('test already submitted');
      return res.status(403).json({
        message: 'You have already submitted the test. You cannot login again.',
      });
    }

    // Schedule-based login restrictions
    const now = new Date();
    if (candidate.schedule) {
      const scheduleTime = new Date(candidate.schedule);

      const loginTimeSettings = await LoginTime.findOne();
      const allowedMinutes = loginTimeSettings?.timeDurationForTest || 30; // "Login Time for Student" in minutes
      const expirationTime = new Date(scheduleTime.getTime() + (allowedMinutes * 60 * 1000));

      console.log(`Current Time: ${now.toISOString()}`);
      console.log(`Schedule Time: ${scheduleTime.toISOString()}`);
      console.log(`Allowed Buffer: ${allowedMinutes} mins`);
      console.log(`Expiration Time: ${expirationTime.toISOString()}`);

      if (now < scheduleTime) {
        return res.status(403).json({
          message: '⏳ Please login at your scheduled interview time',
        });
      }

      if (now > expirationTime) {
        // Mark as expired
        candidate.isSubmitted = 2;
        await candidate.save();
        
        return res.status(403).json({
          message: `Your login window has expired. You could only login within ${allowedMinutes} minutes of your scheduled time.`,
        });
      }
    }

    // JWT
    const token = jwt.sign(
      { id: candidate._id, email: candidate.email },
      process.env.JWT_SECRET,
      { expiresIn: '2m' }
    );

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        position: candidate.position,
        questionsAskedToCandidate: candidate.questionsAskedToCandidate,
        timeforTest: candidate.timeforTest,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
