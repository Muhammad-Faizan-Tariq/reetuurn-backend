import jwt from "jsonwebtoken";
import AuthUser from "../models/authuser.model.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    // console.log("No Authorization header found");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    // console.log("No token found in Authorization header");
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
   
    const user = await AuthUser.findById(decoded._id);
    if (!user) {
      // console.log("User not found in database");
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      // console.log("Password was changed after token issued");
      return res.status(401).json({
        success: false,
        message: "Password was changed. Please login again."
      });
    }

    req.user = user;
    // console.log("Token verified. User:", user.email);
    next();
  } catch (err) {
    // console.log("Token verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }
};