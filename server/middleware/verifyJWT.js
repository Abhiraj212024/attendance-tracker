const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No auth token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err || !decoded) {
      console.log("JWT error:", err);
      return res.sendStatus(403);
    }


    // ✅ Pick the correct field
    const userId =
      decoded.id ||
      decoded.userId ||
      decoded?.UserInfo?.id;

    if (!userId) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    req.user = userId;
    next();
  });
};

module.exports = verifyJWT;
