const Candidate = require("../../models/Candidate");
const Position = require("../../models/Position");
const Question = require("../../models/Question");
const Test = require("../../models/Test");

// Simple test endpoint
exports.testEndpoint = async (req, res) => {
  console.log('🧪 TEST ENDPOINT CALLED');
  res.json({ message: 'Test endpoint working!', timestamp: new Date().toISOString() });
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {

  try {
    const now = new Date();
    // Get all candidates with proper population - no pagination for dashboard
    const candidates = await Candidate.find({}).populate({
      path: 'position',
      select: 'name'
    });
    
    // Get all positions
    const positions = await Position.find({});
    
    // Get all questions
    const questions = await Question.find({});
    
    // Get all tests
    const tests = await Test.find({});
    
    // Calculate statistics
    const totalCandidates = candidates.length;
    const totalPositions = positions.length;
    const totalQuestions = questions.length;
    const totalTests = tests.length;
    
    // Interview statistics
    const scheduledInterviews = candidates.filter(c => c.schedule && new Date(c.schedule) > now).length;
    const completedInterviews = candidates.filter(c => c.schedule && new Date(c.schedule) <= now).length;
    const pendingInterviews = candidates.filter(c => !c.schedule).length;
    
    // Experience distribution
    const experienceDistribution = {};
    candidates.forEach(candidate => {
      const exp = candidate.experience || 'unknown';
      experienceDistribution[exp] = (experienceDistribution[exp] || 0) + 1;
    });
    
    // Position distribution - include all positions even with 0 candidates
    const positionDistribution = {};
    // Initialize all positions with 0 count
    positions.forEach(position => {
      positionDistribution[position.name] = 0;
    });
    // Count candidates for each position
    candidates.forEach(candidate => {
      const pos = candidate.position?.name || 'Unknown Position';
      // console.log(`Candidate: ${candidate.name}, Position: ${pos}`);
      if (positionDistribution.hasOwnProperty(pos)) {
        positionDistribution[pos] = (positionDistribution[pos] || 0) + 1;
      } else {
        positionDistribution[pos] = 1;
      }
    });
        
    // Recent candidates (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCandidates = candidates
      .filter(c => new Date(c.createdAt) > sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        experience: c.experience,
        position: c.position?.name,
        createdAt: c.createdAt
      }));
    
    // Upcoming interviews (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingInterviews = candidates
      .filter(c => c.schedule && new Date(c.schedule) > now && new Date(c.schedule) <= nextWeek)
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule))
      .slice(0, 10)
      .map(c => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        schedule: c.schedule,
        position: c.position?.name
      }));
    
    // Monthly statistics (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthCandidates = candidates.filter(c => 
        new Date(c.createdAt) >= monthStart && new Date(c.createdAt) <= monthEnd
      ).length;
      
      const monthInterviews = candidates.filter(c => 
        c.schedule && new Date(c.schedule) >= monthStart && new Date(c.schedule) <= monthEnd
      ).length;
      
      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        candidates: monthCandidates,
        interviews: monthInterviews
      });
    }
    
    // Success rate calculation
    const totalScheduledInterviews = candidates.filter(c => c.schedule).length;
    const successRate = totalScheduledInterviews > 0 ? 
      Math.round((completedInterviews / totalScheduledInterviews) * 100) : 0;
        res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCandidates,
          totalPositions,
          totalQuestions,
          totalTests,
          scheduledInterviews,
          completedInterviews,
          pendingInterviews,
          successRate
        },
        distributions: {
          experience: experienceDistribution,
          position: positionDistribution
        },
        recent: {
          candidates: recentCandidates,
          interviews: upcomingInterviews
        },
        trends: {
          monthly: monthlyStats
        }
      }
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

// Get detailed analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const candidates = await Candidate.find({
      createdAt: { $gte: startDate }
    }).populate('position', 'name');
    
    // Daily registration trend
    const dailyTrend = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend[dateStr] = 0;
    }
    
    candidates.forEach(candidate => {
      const dateStr = new Date(candidate.createdAt).toISOString().split('T')[0];
      if (dailyTrend.hasOwnProperty(dateStr)) {
        dailyTrend[dateStr]++;
      }
    });
    
    // Convert to array format for charts
    const trendData = Object.entries(dailyTrend)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date,
        count
      }));
    
    // Top positions by applications
    const positionStats = {};
    candidates.forEach(candidate => {
      const pos = candidate.position?.name || 'Unknown';
      positionStats[pos] = (positionStats[pos] || 0) + 1;
    });
    
    const topPositions = Object.entries(positionStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([position, count]) => ({ position, count }));
    
    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        trend: trendData,
        topPositions,
        totalRegistrations: candidates.length
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};