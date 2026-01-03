const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  // Check for token in Authorization header first
  let token = req.headers.authorization;
  
  // If not in header, check URL params (for backward compatibility)
  if (!token) {
    token = req.params.token;
  }
  
  // Extract token from "Bearer <token>" format
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data in req.user
    req.tokenData = decoded; // Keep for backward compatibility
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Token verification failed" });
    }
  }
};

module.exports = authMiddleware;
