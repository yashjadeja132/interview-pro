const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "omsolanki1342@gmail.com",  
    pass: "vqcfcrihsaxpndyo"        
  }
});

// reusable function
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: "omsolanki1342@gmail.com",
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}

module.exports = sendEmail;