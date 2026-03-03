const sendEmail = require("../utils/sendmail");
const fs = require("fs");
const path = require("path");

exports.sendCandidateMail = async (candidate, plainPassword) => {
  const loginUrl = `${process.env.FrontendUrl}/candidate/login`;
    console.log('loginUrl',loginUrl)
    console.log('plainPassword',plainPassword)
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
        <div class="email-container">
          <div class="header">
            <h1 class="company-name">SparrowSofttech</h1>
            <p class="tagline">Success Through Collaboration</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${candidate.name},</div>
            
            <p class="main-text">Welcome to <strong>SparrowSofttech</strong>. We are pleased to invite you to participate in the interview process for the <strong>${candidate.position.name}</strong> position.</p>
            
            <div class="credentials-section">
              <div class="credentials-title">Your Access Credentials</div>
              <div class="credential-item">
                <span class="credential-label">Email:</span> ${candidate.email}
              </div>
              <div class="credential-item">
                <span class="credential-label">Password:</span> ${plainPassword}
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none !important; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Access Interview Portal
              </a>
            </div>
            
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Position:</span>
                <span class="info-value">${candidate.position.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Schedule:</span>
                <span class="info-value">${InterviewTime}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Experience:</span>
                <span class="info-value">${candidate.experience} years</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duration:</span>
                <span class="info-value">${candidate.timeforTest ? candidate.timeforTest + ' minutes' : 'N/A'}</span>
              </div>
            </div>
            
            <div class="notes-section">
              <div class="notes-title">Important Instructions</div>
              <ul class="notes-list">
                <li>Please ensure a stable internet connection before starting.</li>
                <li>The assessment should be completed in a quiet environment.</li>
                <li>Your device must have a working camera and microphone.</li>
                <li>Complete the assessment before your scheduled interview time.</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Regards,<br>
              <strong>HR Team • SparrowSofttech</strong><br>
              sparrowsofttech.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

exports.sendRescheduleMail = async (candidate, oldSchedule) => {
  const loginUrl = `${process.env.FrontendUrl}/candidate/login`;

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const oldTime = formatTime(oldSchedule);
  const newTime = formatTime(candidate.schedule);

  const cssPath = path.join(__dirname, "emailStyles.css");
  const emailStyles = fs.readFileSync(cssPath, "utf8");

  await sendEmail({
    to: candidate.email,
    subject: "Interview Rescheduled - SparrowSofttech",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Rescheduled</title>
        <style>
          ${emailStyles}
          .reschedule-alert {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          }
          .time-label {
            font-size: 13px;
            color: #9a3412;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .old-time {
            text-decoration: line-through;
            color: #94a3b8;
            font-size: 15px;
          }
          .new-time {
            color: #1e293b;
            font-weight: 700;
            font-size: 18px;
            margin-top: 4px;
          }
          .arrow {
            color: #fdba74;
            margin: 8px 0;
            font-size: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 class="company-name">SparrowSofttech</h1>
            <p class="tagline">Success Through Collaboration</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${candidate.name},</div>
            
            <p class="main-text">Your interview for the <strong>${candidate.position.name}</strong> position has been rescheduled. Please find the updated schedule below.</p>
            
            <div class="reschedule-alert">
              <div class="time-label">PREVIOUS SCHEDULE</div>
              <div class="old-time">${oldTime}</div>
              <div class="arrow">↓</div>
              <div class="time-label">NEW SCHEDULE</div>
              <div class="new-time">${newTime}</div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none !important; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Access Interview Portal
              </a>
            </div>
            
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Position:</span>
                <span class="info-value">${candidate.position.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Duration:</span>
                <span class="info-value">${candidate.timeforTest ? candidate.timeforTest + ' minutes' : 'N/A'}</span>
              </div>
            </div>
            
            <div class="notes-section">
              <div class="notes-title">Important Notes</div>
              <ul class="notes-list">
                <li>Your previous login credentials remain valid.</li>
                <li>Please ensure you are ready at the new scheduled time.</li>
                <li>Technical requirements (camera, microphone) remain the same.</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Regards,<br>
              <strong>HR Team • SparrowSofttech</strong><br>
              sparrowsofttech.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
