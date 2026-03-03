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
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #1e293b; padding: 40px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">SparrowSofttech</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.8; font-weight: 400;">Success Through Collaboration</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0; font-size: 22px; color: #0f172a; font-weight: 700;">Assessment Completed</h2>
                <p style="margin: 8px 0 0 0; font-size: 16px; color: #64748b;">Hello ${candidateName || 'Candidate'}, thank you for completing the test.</p>
              </div>

              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e2e8f0; margin-bottom: 32px;">
                <div style="font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">OVERALL SCORE</div>
                <div style="font-size: 48px; font-weight: 800; color: #2563eb;">${percentage}%</div>
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                  <tr>
                    <td width="50%" style="text-align: center;">
                      <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${correctCount}</div>
                      <div style="font-size: 13px; color: #64748b; font-weight: 600;">Correct Answers</div>
                    </td>
                    <td width="50%" style="text-align: center; border-left: 1px solid #e2e8f0;">
                      <div style="font-size: 20px; font-weight: 700; color: #1e293b;">${totalQuestions}</div>
                      <div style="font-size: 13px; color: #64748b; font-weight: 600;">Total Questions</div>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #64748b; width: 120px;">Position:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #1e293b;">${positionName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #64748b; width: 120px;">Status:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #1e293b;">Assessment Completed</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 32px 0 0 0; font-size: 15px; text-align: center; color: #64748b; line-height: 1.6;">
                We appreciate the time and effort you put into this assessment. Our team will review your results and get back to you shortly.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                Regards,<br>
                <strong>HR Team • SparrowSofttech</strong><br>
                sparrowsofttech.com
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("❌ Error sending result mail:", error.message);
  }
};
