const jwt = require("jsonwebtoken");

exports.verifySchedule = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = new Date();
    const scheduleTime = new Date(decoded.schedule);
    console.log('login schedule',scheduleTime)
    if (now < scheduleTime) {
      return res.status(403).json({
        message: "You can only login at your scheduled time ⏰",
      })}
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
