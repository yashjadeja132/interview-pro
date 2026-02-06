const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "atharv.webyug@gmail.com",
    pass: "brqo jkbg uauq rbxv",
  },
});

// reusable function
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: "atharv.webyug@gmail.com",
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log('error in sendEmail',error)
    console.error("❌ Error sending email:", error.message);
  }
}

module.exports = sendEmail;
