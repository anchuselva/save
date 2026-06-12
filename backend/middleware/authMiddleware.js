const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "savelkr_secret_key");
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
