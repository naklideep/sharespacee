const User = require("../models/User");

async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("role isBlocked").lean();
    if (!user || user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account cannot access administration." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Administrator access required." });
    }
    req.admin = user;
    next();
  } catch (error) {
    console.error("ADMIN AUTHORIZATION ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to verify administrator access." });
  }
}
module.exports = adminMiddleware;
