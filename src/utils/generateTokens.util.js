import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();


const user = {
  _id: "68a23177cf3e43f2f83df68c",
  email: "john.ali@example.com",
};


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


const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);


// console.log("🔐 Generated Access Token:\n", accessToken);
// console.log("🔄 Generated Refresh Token:\n", refreshToken);


// console.log("\n📦 Decoded Access Token Payload:");
// console.log(jwt.decode(accessToken));

// console.log("\n📦 Decoded Refresh Token Payload:");
// console.log(jwt.decode(refreshToken));
