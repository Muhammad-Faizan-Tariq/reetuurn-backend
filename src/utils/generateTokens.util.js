import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// ✅ Sample user object
const user = {
  _id: "68a23177cf3e43f2f83df68c",
  email: "john.ali@example.com",
};

// ✅ Access Token Generator
export const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "55m" }
  );
};

// ✅ Refresh Token Generator
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Generate Tokens
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

// ✅ Log Tokens
console.log("🔐 Generated Access Token:\n", accessToken);
console.log("🔄 Generated Refresh Token:\n", refreshToken);

// ✅ Decode Tokens (without verifying signature)
console.log("\n📦 Decoded Access Token Payload:");
console.log(jwt.decode(accessToken));

console.log("\n📦 Decoded Refresh Token Payload:");
console.log(jwt.decode(refreshToken));
