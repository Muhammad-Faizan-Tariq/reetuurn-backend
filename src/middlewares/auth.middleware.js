import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("❌ No Authorization header found");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ No token found in Authorization header");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    console.log("✅ Token verified. Decoded user:", decoded);
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }
};
