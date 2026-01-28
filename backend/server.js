// server.js
const express = require('express')
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const adminRoutes = require('./routes/admin/AdminRoutes')
const adminDashboardRoutes = require('./routes/admin/AdminDashboardRoutes')
// const attemptManagementRoutes = require('./routes/admin/attemptManagementRoutes')
const authRoutes = require('./routes/authRoutes')
const hrRoutes = require('./routes/hr/hrRoute')
const CandidateRoutes = require('./routes/candidate/candidateauthRoute')
const positionRoutes = require('./routes/admin/positionroutes')
const questionRoutes = require('./routes/admin/QuestionRoutes')
const testRoutes = require('./routes/test/testRoutes')
const testAttemptRoutes = require('./routes/test/testAttemptRoutes')
const recordingRoutes = require('./routes/admin/recordingRoutes')
const TestProgressRoutes = require('./routes/testProgres/testProgressRoutes')
const candidateRetestRequestRoutes = require('./routes/candidate/retestRequestRoutes')
const adminRetestRequestRoutes = require('./routes/admin/retestRequestRoutes')
const passwordRoutes = require('./routes/admin/PasswordRoutes')
const profileRoutes = require('./routes/admin/ProfileRoutes')
const settingsRoutes = require('./routes/admin/SettingsRoutes');
const path = require("path");
dotenv.config();
// Connect Database
connectDB();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.1.27:5173"
    ],
    credentials: true              // allow cookies, authorization headers
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/admin/change-password', passwordRoutes)
app.use('/api/admin', profileRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/settings', settingsRoutes);
// app.use('/api/admin/attempts',attemptManagementRoutes)
// app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/hr', hrRoutes)
app.use('/api/question', questionRoutes)
app.use('/api/candidates', CandidateRoutes)
app.use('/api/position', positionRoutes)
app.use('/api/test', testRoutes)
app.use('/api/test-attempt', testAttemptRoutes)
app.use('/api/recording', recordingRoutes)
app.use('/api/test-progress', TestProgressRoutes)
app.use('/api/candidates/retest', candidateRetestRequestRoutes)
app.use('/api/admin/retest-requests', adminRetestRequestRoutes)
// app.use('/api/admin/change-password', passwordRoutes) - Removed duplicate
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.1.27:5173"
    ],
    credentials: true
  }
});
const deleteOldProgress = require('./cronJobs/deleteOldProgress');
deleteOldProgress.start();
const Host = "0.0.0.0"
const PORT = process.env.PORT || 5000;
app.listen(PORT, Host, () => console.log(`Server running on port ${PORT}`));
