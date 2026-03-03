const sendEmail = require("../utils/sendmail");

exports.forgotPasswordEmail = async (user) => {
    console.log('user in forgotPasswordEmail', user)
    await sendEmail({
        to: user,
        subject: "Reset Password",
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #1e293b; padding: 40px 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Interview Pro</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.6;">Hello,</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.6;">We received a request to reset the password for your Interview Pro account. If you didn't make this request, you can safely ignore this email.</p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.FrontendUrl}admin/reset-password/${user}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                For security, this link will expire in a short time. Please do not share this email with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                &copy; ${new Date().getFullYear()} Interview Pro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
        `
    })
}