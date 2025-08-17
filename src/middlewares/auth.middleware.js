import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });

  const token = authHeader.split(" ")[1]; 
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user" });
  }
};
