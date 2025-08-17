import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email }, 
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "55m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
