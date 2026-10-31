const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured on the server.",
    });
  }

  try {
    const token = authorization.slice(7).trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }

    // Read current account status and role from MongoDB, not from client/JWT claims.
    const user = await User.findById(userId).select("name email role isBlocked").lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found. Please log in again." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account has been suspended." });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
    console.error("AUTH MIDDLEWARE ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to verify your account." });
  }
}

module.exports = authMiddleware;
