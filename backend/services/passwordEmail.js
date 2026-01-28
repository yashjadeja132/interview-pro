const sendEmail = require("../utils/sendmail");

exports.forgotPasswordEmail = async (user) => {
    console.log('user in forgotPasswordEmail', user)
    await sendEmail({
        to: user,
        subject: "Reset Password",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #334155;
                        margin: 0;
                        padding: 0;
                        background-color: #f8fafc;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #2563eb 0%, #4338ca 100%);
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        letter-spacing: -0.025em;
                    }
                    .content {
                        padding: 40px;
                    }
                    .content p {
                        margin-bottom: 24px;
                        font-size: 16px;
                    }
                    .cta-container {
                        text-align: center;
                        margin: 32px 0;
                    }
                    .button {
                        background: linear-gradient(135deg, #2563eb 0%, #4338ca 100%);
                        color: #ffffff !important;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                    }
                    .footer {
                        padding: 24px;
                        text-align: center;
                        background-color: #f1f5f9;
                        font-size: 13px;
                        color: #64748b;
                    }
                    .warning {
                        font-size: 14px;
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 24px;
                        margin-top: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Interview Pro</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset the password for your Interview Pro account. No worries, it happens to the best of us!</p>
                        <div class="cta-container">
                            <a href="${process.env.FrontendUrl}admin/reset-password/${user}" class="button">Reset Password</a>
                        </div>
                        <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                        <div class="warning">
                            <p>For security, please do not share this link with anyone.</p>
                        </div>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Interview Pro. All rights reserved.
                    </div>
                    <div class="warning">
                        <p>If you did not request this password reset, please ignore this email.mail sent at time ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `
    })
}