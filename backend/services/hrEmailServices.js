const sendEmail = require("../utils/sendmail");
const fs = require("fs");
const path = require("path");

exports.sendCandidateMail = async (candidate, plainPassword) => {
  const loginUrl = `${process.env.FrontendUrl}candidate/login`;
    console.log(loginUrl)
    console.log(plainPassword)
  
const InterviewTime = candidate.schedule 
  ? new Date(candidate.schedule).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  : "Time to be announced";
  console.log('interview time is in email', InterviewTime)

  // Read CSS file
  const cssPath = path.join(__dirname, "emailStyles.css");
  const emailStyles = fs.readFileSync(cssPath, "utf8");
  
  await sendEmail({
    to: candidate.email,
    subject: "Welcome to SparrowSofttech - Interview Portal Access",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Portal Access</title>
        <style>
          ${emailStyles}
        </style>
      </head>
      <body>
        <div class="container-fluid p-0">
          <div class="email-container">
            <!-- Header Section -->
            <div class="header">
             
              <h1 class="company-name">SparrowSofttech</h1>
              <p class="tagline">Innovation Through Technology</p>
            </div>
            
            <!-- Main Content -->
            <div class="content">
              <div class="greeting">Hello ${candidate.name}! 👋</div>
              
              <p style="margin-bottom: 1.5rem;">Welcome to <strong>SparrowSofttech</strong>! We're excited to have you join our interview process for the <strong>${candidate.position.name}</strong> position.</p>
              
              <!-- Login Credentials Section -->
              <div class="credentials-section">
                <div class="credentials-title">🔐 Your Login Credentials</div>
                <div style="display: flex; flex-wrap: wrap; margin: 0 -0.75rem;">
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="credential-item">
                      📧 <strong>Email:</strong> ${candidate.email}
                    </div>
                  </div>
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="credential-item">
                      🔒 <strong>Password:</strong> ${plainPassword}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Login Button -->
              <div style="text-align: center; margin: 1.5rem 0;">
                <a href="${loginUrl}" class="login-button" style="color: white !important; text-decoration: none;">
                  🚀 Access Interview Portal
                </a>
              </div>
              
              <!-- Interview Details -->
              <div class="info-card">
                <h5 style="margin-bottom: 1rem;">ℹ️ Interview Details</h5>
                <div style="display: flex; flex-wrap: wrap; margin: 0 -0.75rem;">
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="info-item">
                      <span class="info-label">📋 Position:</span>
                      <span class="info-value">${candidate.position.name}</span>
                    </div>
                  </div>
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="info-item">
                      <span class="info-label">📅 Interview Date:</span>
                      <span class="info-value">${InterviewTime}</span>
                    </div>
                  </div>
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="info-item">
                      <span class="info-label">💼 Experience:</span>
                      <span class="info-value">${candidate.experience} years</span>
                    </div>
                  </div>
                  <div style="flex: 0 0 100%; max-width: 100%; padding: 0 0.75rem;">
                    <div class="info-item">
                      <span class="info-label">⏱️ Test Duration:</span>
                      <span class="info-value">${candidate.timeforTest ? candidate.timeforTest + ' minutes' : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Important Notes -->
              <div class="notes-section">
                <div class="notes-title">📝 Important Notes</div>
                <ul class="notes-list">
                  <li>🛡️ Keep your login credentials secure and don't share them with anyone</li>
                  <li>📶 Complete the assessment in a quiet environment with stable internet</li>
                  <li>📹 Ensure your device has a working camera and microphone</li>
                  <li>🎧 Contact us immediately if you face any technical issues</li>
                  <li>⏰ Complete your assessment before the scheduled interview time</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                Best regards,<br>
                <strong>HR Team - SparrowSofttech</strong><br>
                <em>Building Tomorrow's Technology Today</em>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
