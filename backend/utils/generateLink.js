const crypto = require("crypto");
function generateRandomLink(baseUrl) {
  // Create a random token
  const token = crypto.randomBytes(16).toString("hex"); // 32-character hex string
  return `${baseUrl}/register/${token}`;
}