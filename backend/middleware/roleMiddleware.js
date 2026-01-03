const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    // Check both req.user and req.tokenData for backward compatibility
    const user = req.user || req.tokenData;
      // console.log('user',user)
    if (!user || !user.role || !user.role.some(role => roles.includes(role))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
        next();
  };
};

module.exports = authorizeRoles;
