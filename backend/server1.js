const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/live_test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// MongoDB Schemas
const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  testStarted: { type: Date, default: Date.now },
  testCompleted: Boolean,
  answers: Object,
  recordingUrl: String
});

const liveStreamSchema = new mongoose.Schema({
  candidateId: mongoose.Schema.Types.ObjectId,
  streamData: Buffer,
  timestamp: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', candidateSchema);
const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io for live streaming
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // HR watching live stream
  socket.on('join-hr-room', () => {
    socket.join('hr-room');
    console.log('HR joined watching room');
  });

  // Candidate sending stream data
  socket.on('live-stream', async (data) => {
    // Save stream data to MongoDB
    const streamData = new LiveStream({
      candidateId: data.candidateId,
      streamData: Buffer.from(data.stream)
    });
    await streamData.save();

    // Broadcast to HR room
    socket.to('hr-room').emit('live-stream-data', {
      candidateId: data.candidateId,
      stream: data.stream
    });
  });

  // Candidate test started
  socket.on('test-started', async (candidateData) => {
    const candidate = new Student(candidateData);
    await candidate.save();
    socket.candidateId = candidate._id;
    
    socket.to('hr-room').emit('candidate-started', candidate);
  });

  // Candidate test submitted
  socket.on('test-submitted', async (submissionData) => {
    await Candidate.findByIdAndUpdate(submissionData.candidateId, {
      testCompleted: true,
      answers: submissionData.answers,
      recordingUrl: submissionData.recordingUrl
    });

    socket.to('hr-room').emit('candidate-completed', submissionData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/candidates', async (req, res) => {
  const candidates = await Student.find().sort({ testStarted: -1 });
  res.json(candidates);
});

app.get('/api/stream/:candidateId', async (req, res) => {
  const streams = await LiveStream.find({ 
    candidateId: req.params.candidateId 
  }).sort({ timestamp: -1 }).limit(10);
  
  res.json(streams);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});