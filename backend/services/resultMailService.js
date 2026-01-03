const sendEmail = require("../utils/sendmail");

exports.sendResultMail = async (to, { score, totalQuestions, correctCount, candidateName, positionName, candidateId }) => {
  try {
    const percentage = score.toFixed(2);
    const resultUrl = `${process.env.FrontendUrl}candidate/result/${candidateId}`;
    
    const subject = "🎉 Your Test Results - SparrowSofttech";
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Results</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .email-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            padding: 50px 20px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.1);
            position: relative;
            z-index: 1;
            border: 3px solid rgba(255, 255, 255, 0.3);
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
          }
          .company-name {
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 12px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 18px;
            opacity: 0.95;
            margin: 0;
            font-weight: 500;
            position: relative;
            z-index: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .content {
            padding: 50px 40px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          }
          .greeting {
            font-size: 24px;
            color: #1e40af;
            margin-bottom: 30px;
            font-weight: 700;
            text-align: center;
          }
          .congratulations {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          }
          .congratulations h2 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 800;
          }
          .congratulations p {
            margin: 0;
            font-size: 18px;
            opacity: 0.9;
          }
          .results-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
            border: 3px solid #f59e0b;
            border-radius: 20px;
            padding: 35px;
            margin: 40px 0;
            text-align: center;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
          }
          .results-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(30deg); }
          }
          .results-title {
            font-weight: 800;
            color: #92400e;
            margin-bottom: 25px;
            font-size: 24px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
          }
          .score-display {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
          }
          .score-number {
            font-size: 48px;
            font-weight: 900;
            color: #1e40af;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .score-label {
            font-size: 18px;
            color: #64748b;
            margin: 5px 0 0 0;
            font-weight: 600;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
            position: relative;
            z-index: 1;
          }
          .stat-item {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .stat-number {
            font-size: 32px;
            font-weight: 800;
            color: #1e40af;
            margin: 0;
          }
          .stat-label {
            font-size: 14px;
            color: #64748b;
            margin: 5px 0 0 0;
            font-weight: 600;
          }
          .view-details-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            color: white;
            padding: 20px 45px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 800;
            margin: 35px 0;
            font-size: 18px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: 2px solid rgba(255, 255, 255, 0.2);
          }
          .view-details-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          .view-details-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2);
          }
          .view-details-button:hover::before {
            left: 100%;
          }
          .info-card {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-left: 6px solid #667eea;
            padding: 30px;
            margin: 35px 0;
            border-radius: 0 15px 15px 0;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            position: relative;
            overflow: hidden;
          }
          .info-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(30px, -30px);
          }
          .info-item {
            margin: 18px 0;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          .info-label {
            font-weight: 800;
            color: #374151;
            min-width: 150px;
            font-size: 17px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .info-value {
            color: #1f2937;
            flex: 1;
            font-size: 17px;
            font-weight: 600;
          }
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px;
            text-align: center;
            border-top: 2px solid #e2e8f0;
            position: relative;
            overflow: hidden;
          }
          .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
          }
          .footer-text {
            color: #64748b;
            font-size: 16px;
            margin: 0;
            line-height: 1.8;
            font-weight: 500;
          }
          .spacing {
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              <img src="${process.env.BackendUrl || 'http://localhost:5000'}/uploads/sparrowlogo.png" alt="SparrowSofttech Logo" />
            </div>
            <h1 class="company-name">SparrowSofttech</h1>
            <p class="tagline">Innovation Through Technology</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${candidateName || 'Candidate'}! 🎉</div>
            
            <div class="congratulations">
              <h2>🎊 Congratulations!</h2>
              <p>You have successfully completed your assessment for ${positionName || 'the position'}!</p>
            </div>
            
            <!-- RESULTS SECTION -->
            <div class="results-section">
              <div class="results-title">🏆 Your Test Results</div>
              
              <div class="score-display">
                <div class="score-number">${percentage}%</div>
                <div class="score-label">Overall Score</div>
              </div>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">${correctCount}</div>
                  <div class="stat-label">Correct Answers</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${totalQuestions}</div>
                  <div class="stat-label">Total Questions</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" class="view-details-button">📊 View Detailed Results</a>
            </div>
            
            <div class="spacing"></div>
            
            <!-- TEST DETAILS -->
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">📋 Position:</span>
                <span class="info-value">${positionName || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📊 Score:</span>
                <span class="info-value">${percentage}% (${correctCount}/${totalQuestions})</span>
              </div>
              <div class="info-item">
                <span class="info-label">✅ Status:</span>
                <span class="info-value">Assessment Completed</span>
              </div>
            </div>
            
            <div class="spacing"></div>
            
            <p style="font-size: 16px; text-align: center; color: #64748b; margin: 30px 0;">
              Thank you for taking the time to complete our assessment. We appreciate your interest in joining the SparrowSofttech team!
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Best regards,<br>
              <strong>HR Team - SparrowSofttech</strong><br>
              <em>Building Tomorrow's Technology Today</em>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("❌ Error sending result mail:", error.message);
  }
};
